from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import AuditLog, User

logs_bp = Blueprint('logs', __name__)

def get_current_user():
    return User.query.get(int(get_jwt_identity()))


@logs_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_logs():
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(200).all()
    return jsonify([log.to_dict() for log in logs]), 200