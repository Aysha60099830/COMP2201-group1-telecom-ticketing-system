# routes/dashboard.py — Extended metrics for telecom dashboard
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Ticket, User, Fixture
from sqlalchemy import func
from extensions import db

dashboard_bp = Blueprint('dashboard', __name__)

def get_current_user():
    return User.query.get(int(get_jwt_identity()))


@dashboard_bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    user = get_current_user()

    # Status counts — full lifecycle per Spec §5
    status_counts = {}
    for status in ['New', 'Assigned', 'In Progress', 'Resolved', 'Closed']:
        status_counts[status] = Ticket.query.filter_by(status=status).count()

    open_count = status_counts['New'] + status_counts['Assigned'] + status_counts['In Progress']

    # Average resolution time (hours)
    resolved = Ticket.query.filter(Ticket.status.in_(['Resolved', 'Closed'])).all()
    avg_hours = 0
    if resolved:
        durations = []
        for t in resolved:
            end = t.updated_at or t.created_at
            if end and t.created_at:
                diff = (end - t.created_at).total_seconds() / 3600
                if diff >= 0:
                    durations.append(diff)
        if durations:
            avg_hours = round(sum(durations) / len(durations), 2)

    # Priority distribution — now includes Critical
    priority_counts = {}
    for p in ['Low', 'Medium', 'High', 'Critical']:
        priority_counts[p] = Ticket.query.filter_by(priority=p).count()
    # Remove zero entries to keep UI clean
    priority_counts = {k: v for k, v in priority_counts.items() if v > 0}

    # Staff workload
    staff_workload = []
    if user.role in ('admin', 'staff'):
        for s in User.query.filter(User.role.in_(['staff', 'admin'])).all():
            active = Ticket.query.filter(
                Ticket.assigned_to == s.id,
                Ticket.status.in_(['Assigned', 'In Progress'])
            ).count()
            staff_workload.append({'name': s.name, 'active_tickets': active})

    # Recent tickets (last 6) — for dashboard table
    recent = Ticket.query.order_by(Ticket.created_at.desc()).limit(6).all()
    recent_tickets = [t.to_dict() for t in recent]

    # Fixtures with open tickets — for signal-bar widget
    fixtures_with_open = []
    for fixture in Fixture.query.all():
        open_count_f = Ticket.query.filter(
            Ticket.fixture_id == fixture.id,
            Ticket.status.in_(['New', 'Assigned', 'In Progress'])
        ).count()
        if open_count_f > 0:
            fixtures_with_open.append({
                'id':         fixture.id,
                'type':       fixture.type,
                'location':   fixture.location,
                'open_count': open_count_f,
            })

    return jsonify({
        'open_tickets':         open_count,
        'status_counts':        status_counts,
        'avg_resolution_hours': avg_hours,
        'priority_counts':      priority_counts,
        'staff_workload':       staff_workload,
        'total_tickets':        Ticket.query.count(),
        'recent_tickets':       recent_tickets,
        'fixtures_with_open':   fixtures_with_open,
    }), 200
