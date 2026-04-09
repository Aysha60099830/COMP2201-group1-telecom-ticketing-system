# routes/tickets.py — CRUD + lifecycle for tickets (Spec §3, §5, §6)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Ticket, AuditLog, User, Fixture

tickets_bp = Blueprint('tickets', __name__)

LIFECYCLE = {
    'New':         'Assigned',
    'Assigned':    'In Progress',
    'In Progress': 'Resolved',
    'Resolved':    'Closed',
    'Closed':      None,
}

VALID_PRIORITIES = ('Low', 'Medium', 'High', 'Critical')

def get_current_user():
    return User.query.get(int(get_jwt_identity()))

def log_action(ticket_id, user_id, action, old_value=None, new_value=None):
    log = AuditLog(
        ticket_id=ticket_id, user_id=user_id, action=action,
        old_value=str(old_value) if old_value is not None else None,
        new_value=str(new_value) if new_value is not None else None,
    )
    db.session.add(log)


@tickets_bp.route('/', methods=['GET'])
@jwt_required()
def get_tickets():
    user = get_current_user()
    status_filter   = request.args.get('status')
    priority_filter = request.args.get('priority')

    query = Ticket.query
    if user.role == 'requester':
        query = query.filter_by(requester_id=user.id)
    if status_filter:
        query = query.filter_by(status=status_filter)
    if priority_filter:
        query = query.filter_by(priority=priority_filter)

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tickets]), 200


@tickets_bp.route('/<int:ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket(ticket_id):
    user   = get_current_user()
    ticket = Ticket.query.get_or_404(ticket_id)
    if user.role == 'requester' and ticket.requester_id != user.id:
        return jsonify({'error': 'Access denied'}), 403
    return jsonify(ticket.to_dict()), 200


@tickets_bp.route('/', methods=['POST'])
@jwt_required()
def create_ticket():
    user = get_current_user()
    data = request.get_json()

    if not data.get('title') or not data.get('description'):
        return jsonify({'error': 'title and description are required'}), 400

    # Priority fix: Requesters always get 'Medium' — they cannot self-select priority.
    # Only Staff and Admin can set or change priority via PUT /tickets/<id>.
    # This prevents every requester from marking their ticket as Critical.
    if user.role == 'requester':
        ticket_priority = 'Medium'
    else:
        raw_priority = str(data.get('priority', 'Medium')).capitalize()
        ticket_priority = raw_priority if raw_priority in VALID_PRIORITIES else 'Medium'

    # Auto-create fixture if type + location provided (Spec §3 — Fixtures table)
    fixture_id = data.get('fixture_id')
    if not fixture_id and data.get('fixture_type') and data.get('fixture_location'):
        fixture = Fixture(
            type=data['fixture_type'],
            location=data['fixture_location'],
        )
        db.session.add(fixture)
        db.session.flush()
        fixture_id = fixture.id

    ticket = Ticket(
        title=data['title'],
        description=data['description'],
        requester_id=user.id,
        priority=ticket_priority,
        fixture_id=fixture_id,
        status='New',
    )
    db.session.add(ticket)
    db.session.flush()

    # Update fixture → related_ticket_id
    if fixture_id:
        f = Fixture.query.get(fixture_id)
        if f:
            f.related_ticket_id = ticket.id

    log_action(ticket.id, user.id, "Ticket created", new_value='New')
    db.session.commit()
    return jsonify(ticket.to_dict()), 201


@tickets_bp.route('/<int:ticket_id>', methods=['PUT'])
@jwt_required()
def update_ticket(ticket_id):
    user   = get_current_user()
    ticket = Ticket.query.get_or_404(ticket_id)
    data   = request.get_json()

    if user.role == 'requester':
        return jsonify({'error': 'Access denied'}), 403

    if 'status' in data:
        new_status = data['status']
        allowed    = LIFECYCLE.get(ticket.status)
        if new_status != allowed:
            return jsonify({'error': f"Invalid transition: '{ticket.status}' → '{new_status}'", 'allowed': allowed}), 400
        log_action(ticket.id, user.id, f"Status changed to '{new_status}'", old_value=ticket.status, new_value=new_status)
        ticket.status = new_status

    if 'title'            in data: ticket.title            = data['title']
    if 'description'      in data: ticket.description      = data['description']
    if 'resolution_notes' in data: ticket.resolution_notes = data['resolution_notes']

    # Priority can only be updated by staff or admin, never by requesters (blocked above)
    if 'priority' in data:
        p = str(data['priority']).capitalize()
        if p in VALID_PRIORITIES:
            old_p = ticket.priority
            ticket.priority = p
            if old_p != p:
                log_action(ticket.id, user.id, f"Priority changed to '{p}'", old_value=old_p, new_value=p)

    if 'assigned_to' in data:
        if user.role != 'admin':
            return jsonify({'error': 'Only admin can assign tickets'}), 403
        staff = User.query.get(data['assigned_to'])
        if not staff or staff.role not in ('staff', 'admin'):
            return jsonify({'error': 'Assigned user must be staff or admin'}), 400
        log_action(ticket.id, user.id, f"Ticket assigned to {staff.name}", old_value=ticket.assigned_to, new_value=data['assigned_to'])
        ticket.assigned_to = data['assigned_to']

    db.session.commit()
    return jsonify(ticket.to_dict()), 200


@tickets_bp.route('/<int:ticket_id>', methods=['DELETE'])
@jwt_required()
def delete_ticket(ticket_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    ticket = Ticket.query.get_or_404(ticket_id)
    AuditLog.query.filter_by(ticket_id=ticket_id).delete()
    db.session.delete(ticket)
    db.session.commit()
    return jsonify({'message': 'Ticket deleted'}), 200


@tickets_bp.route('/<int:ticket_id>/logs', methods=['GET'])
@jwt_required()
def get_ticket_logs(ticket_id):
    logs = AuditLog.query.filter_by(ticket_id=ticket_id).order_by(AuditLog.timestamp.asc()).all()
    return jsonify([l.to_dict() for l in logs]), 200
