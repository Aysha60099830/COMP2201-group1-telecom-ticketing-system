"""
Dashboard Routes — spec Section 8:
Metrics: open tickets, average resolution time, staff workload.
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Ticket, User
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    identity = get_jwt_identity()
    role = identity['role']

    # Ticket counts by status — spec Section 8
    status_counts = {}
    for status in ['New', 'Assigned', 'In Progress', 'Resolved', 'Closed']:
        count = Ticket.query.filter_by(status=status).count()
        status_counts[status] = count

    open_count = sum([
        status_counts['New'],
        status_counts['Assigned'],
        status_counts['In Progress']
    ])

    # Average resolution time (Resolved + Closed)
    resolved = Ticket.query.filter(Ticket.status.in_(['Resolved', 'Closed'])).all()
    avg_hours = 0
    if resolved:
        total_hours = sum([
            (t.updated_at - t.created_at).total_seconds() / 3600
            for t in resolved
        ])
        avg_hours = round(total_hours / len(resolved), 2)

    # Priority distribution
    priority_counts = {}
    for priority in ['low', 'medium', 'high', 'critical']:
        priority_counts[priority] = Ticket.query.filter_by(priority=priority).count()

    # Staff workload — spec Section 8
    staff_workload = []
    if role in ['admin', 'staff']:
        staff = User.query.filter(User.role.in_(['staff', 'admin'])).all()
        for s in staff:
            active = Ticket.query.filter(
                Ticket.assigned_to == s.id,
                Ticket.status.in_(['Assigned', 'In Progress'])
            ).count()
            staff_workload.append({'name': s.name, 'active_tickets': active})

    return jsonify({
        'open_tickets': open_count,
        'status_counts': status_counts,
        'avg_resolution_hours': avg_hours,
        'priority_counts': priority_counts,
        'staff_workload': staff_workload,
        'total_tickets': Ticket.query.count()
    }), 200
