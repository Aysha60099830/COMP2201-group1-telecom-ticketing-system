"""
Authentication Routes — spec Section 4
Login, Register, Password Hashing (bcrypt), Role-based Access Control
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db, bcrypt
from models import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    for field in ['name', 'email', 'password']:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    if len(data.get('password', '')) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(
        name          = data['name'],
        email         = data['email'],
        password_hash = hashed_pw,
        role          = 'requester',  # Always requester on self-registration
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully', 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, data.get('password', '')):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Store only the user ID as identity (simple int — avoids JWT 422 issues)
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200
