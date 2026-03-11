"""
Audit Logs Routes — spec Section 6:
All changes logged with user, action, and timestamp.
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import AuditLog

logs_bp = Blueprint('logs', __name__)


@logs_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_logs():
    """Get all audit logs. Admin only — spec Section 6."""
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(200).all()
    return jsonify([log.to_dict() for log in logs]), 200
