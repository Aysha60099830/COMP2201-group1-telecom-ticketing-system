"""
User Management Routes — spec Section 4 (RBAC):
Admin can manage users; staff/requester can view profiles.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db, bcrypt
from models import User

users_bp = Blueprint('users', __name__)


@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users. Admin and staff only."""
    identity = get_jwt_identity()
    if identity['role'] == 'requester':
        return jsonify({'error': 'Access denied'}), 403
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


@users_bp.route('/staff', methods=['GET'])
@jwt_required()
def get_staff():
    """Get all staff users for ticket assignment."""
    identity = get_jwt_identity()
    if identity['role'] == 'requester':
        return jsonify({'error': 'Access denied'}), 403
    staff = User.query.filter(User.role.in_(['staff', 'admin'])).all()
    return jsonify([u.to_dict() for u in staff]), 200


@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user role. Admin only — spec Section 4."""
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if 'role' in data:
        user.role = data['role']
    if 'name' in data:
        user.name = data['name']
    if 'password' in data:
        user.password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    db.session.commit()
    return jsonify(user.to_dict()), 200


@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete user. Admin only."""
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200
