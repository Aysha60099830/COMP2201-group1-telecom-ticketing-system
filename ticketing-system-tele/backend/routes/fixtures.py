from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Fixture, User

fixtures_bp = Blueprint('fixtures', __name__)

FIXTURE_TYPES = ['5G Tower', 'Fiber Node', 'Signal Booster', 'Router Hub', 'Base Station', 'Optical Line Terminal']

def get_current_user():
    return User.query.get(int(get_jwt_identity()))


@fixtures_bp.route('/', methods=['GET'])
@jwt_required()
def get_fixtures():
    return jsonify([f.to_dict() for f in Fixture.query.all()]), 200


@fixtures_bp.route('/types', methods=['GET'])
@jwt_required()
def get_fixture_types():
    return jsonify(FIXTURE_TYPES), 200


@fixtures_bp.route('/', methods=['POST'])
@jwt_required()
def create_fixture():
    user = get_current_user()
    if user.role == 'requester':
        return jsonify({'error': 'Access denied'}), 403
    data    = request.get_json()
    fixture = Fixture(type=data.get('type'), location=data.get('location'), related_ticket_id=data.get('related_ticket_id'))
    db.session.add(fixture)
    db.session.commit()
    return jsonify(fixture.to_dict()), 201


@fixtures_bp.route('/<int:fixture_id>', methods=['PUT'])
@jwt_required()
def update_fixture(fixture_id):
    user = get_current_user()
    if user.role == 'requester':
        return jsonify({'error': 'Access denied'}), 403
    fixture = Fixture.query.get_or_404(fixture_id)
    data    = request.get_json()
    if 'type'              in data: fixture.type              = data['type']
    if 'location'          in data: fixture.location          = data['location']
    if 'related_ticket_id' in data: fixture.related_ticket_id = data['related_ticket_id']
    db.session.commit()
    return jsonify(fixture.to_dict()), 200


@fixtures_bp.route('/<int:fixture_id>', methods=['DELETE'])
@jwt_required()
def delete_fixture(fixture_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    fixture = Fixture.query.get_or_404(fixture_id)
    db.session.delete(fixture)
    db.session.commit()
    return jsonify({'message': 'Fixture deleted'}), 200