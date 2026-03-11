"""
Ticket Routes — spec Sections 3, 5, 6:
Full CRUD operations + lifecycle workflow:
New → Assigned → In Progress → Resolved → Closed
All status changes are logged in the audit trail (spec Section 6).
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Ticket, AuditLog, User

tickets_bp = Blueprint('tickets', __name__)

# Allowed lifecycle transitions — spec Section 5
LIFECYCLE = {
    'New': ['Assigned'],
    'Assigned': ['In Progress'],
    'In Progress': ['Resolved'],
    'Resolved': ['Closed'],
    'Closed': []
}


def log_action(ticket_id, user_id, action):
    """Helper to write an audit log entry — spec Section 6."""
    log = AuditLog(ticket_id=ticket_id, user_id=user_id, action=action)
    db.session.add(log)


@tickets_bp.route('/', methods=['GET'])
@jwt_required()
def get_tickets():
    """
    Get tickets based on role — spec Section 4 (RBAC):
    - Requester: only their own tickets
    - Staff/Admin: all tickets
    """
    identity = get_jwt_identity()
    role = identity['role']
    user_id = identity['id']

    status_filter = request.args.get('status')
    priority_filter = request.args.get('priority')

    query = Ticket.query
    if role == 'requester':
        query = query.filter_by(requester_id=user_id)
    if status_filter:
        query = query.filter_by(status=status_filter)
    if priority_filter:
        query = query.filter_by(priority=priority_filter)

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tickets]), 200


@tickets_bp.route('/<int:ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    identity = get_jwt_identity()

    # Requesters can only view their own tickets — spec Section 4
    if identity['role'] == 'requester' and ticket.requester_id != identity['id']:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify(ticket.to_dict()), 200


@tickets_bp.route('/', methods=['POST'])
@jwt_required()
def create_ticket():
    """Create a new ticket. Default status is 'New' — spec Section 5."""
    identity = get_jwt_identity()
    data = request.get_json()

    required = ['title', 'description']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    ticket = Ticket(
        title=data['title'],
        description=data['description'],
        requester_id=identity['id'],
        priority=data.get('priority', 'medium'),
        status='New'  # Lifecycle start — spec Section 5
    )
    db.session.add(ticket)
    db.session.flush()  # Get ticket.id before commit

    log_action(ticket.id, identity['id'], f"Ticket created with status 'New'")
    db.session.commit()

    return jsonify(ticket.to_dict()), 201


@tickets_bp.route('/<int:ticket_id>', methods=['PUT'])
@jwt_required()
def update_ticket(ticket_id):
    """Update ticket fields. Status changes follow lifecycle rules — spec Section 5."""
    identity = get_jwt_identity()
    role = identity['role']
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()

    # Requesters cannot update tickets — spec Section 4
    if role == 'requester':
        return jsonify({'error': 'Access denied'}), 403

    # Lifecycle validation — spec Section 5
    if 'status' in data:
        new_status = data['status']
        allowed = LIFECYCLE.get(ticket.status, [])
        if new_status not in allowed:
            return jsonify({
                'error': f"Invalid status transition: '{ticket.status}' → '{new_status}'",
                'allowed': allowed
            }), 400
        old_status = ticket.status
        ticket.status = new_status
        log_action(ticket.id, identity['id'], f"Status changed: '{old_status}' → '{new_status}'")

    if 'title' in data:
        ticket.title = data['title']
    if 'description' in data:
        ticket.description = data['description']
    if 'priority' in data:
        ticket.priority = data['priority']

    # Only admin can assign tickets — spec Section 4
    if 'assigned_to' in data:
        if role != 'admin':
            return jsonify({'error': 'Only admin can assign tickets'}), 403
        staff = User.query.get(data['assigned_to'])
        if not staff or staff.role not in ['staff', 'admin']:
            return jsonify({'error': 'Assigned user must be staff or admin'}), 400
        ticket.assigned_to = data['assigned_to']
        log_action(ticket.id, identity['id'], f"Ticket assigned to user ID {data['assigned_to']}")

    db.session.commit()
    return jsonify(ticket.to_dict()), 200


@tickets_bp.route('/<int:ticket_id>', methods=['DELETE'])
@jwt_required()
def delete_ticket(ticket_id):
    """Delete a ticket. Admin only — spec Section 4."""
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    ticket = Ticket.query.get_or_404(ticket_id)
    # Delete related logs first
    AuditLog.query.filter_by(ticket_id=ticket_id).delete()
    db.session.delete(ticket)
    db.session.commit()
    return jsonify({'message': 'Ticket deleted'}), 200


@tickets_bp.route('/<int:ticket_id>/logs', methods=['GET'])
@jwt_required()
def get_ticket_logs(ticket_id):
    """Get audit trail for a ticket — spec Section 6."""
    logs = AuditLog.query.filter_by(ticket_id=ticket_id).order_by(AuditLog.timestamp.asc()).all()
    return jsonify([log.to_dict() for log in logs]), 200
