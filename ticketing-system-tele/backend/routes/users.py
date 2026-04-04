from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db, bcrypt
from models import User

users_bp = Blueprint('users', __name__)

def get_current_user():
    return User.query.get(int(get_jwt_identity()))


@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    user = get_current_user()
    if user.role == 'requester':
        return jsonify({'error': 'Access denied'}), 403
    return jsonify([u.to_dict() for u in User.query.all()]), 200


@users_bp.route('/staff', methods=['GET'])
@jwt_required()
def get_staff():
    user = get_current_user()
    if user.role == 'requester':
        return jsonify({'error': 'Access denied'}), 403
    staff = User.query.filter(User.role.in_(['staff', 'admin'])).all()
    return jsonify([u.to_dict() for u in staff]), 200


@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current = get_current_user()
    if current.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    if 'role'     in data: user.role      = data['role']
    if 'name'     in data: user.name      = data['name']
    if 'password' in data: user.password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    db.session.commit()
    return jsonify(user.to_dict()), 200


@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current = get_current_user()
    if current.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200