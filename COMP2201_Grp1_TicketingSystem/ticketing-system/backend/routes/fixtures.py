"""
Fixtures Routes — spec Section 3:
Fixtures: ID, type, location, related_ticket_id
Telecom context: 5G Towers, Fiber Nodes, Signal Boosters, etc.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Fixture

fixtures_bp = Blueprint('fixtures', __name__)

# Telecom fixture types
FIXTURE_TYPES = ['5G Tower', 'Fiber Node', 'Signal Booster', 'Router Hub', 'Base Station', 'Optical Line Terminal']


@fixtures_bp.route('/', methods=['GET'])
@jwt_required()
def get_fixtures():
    fixtures = Fixture.query.all()
    return jsonify([f.to_dict() for f in fixtures]), 200


@fixtures_bp.route('/types', methods=['GET'])
@jwt_required()
def get_fixture_types():
    """Return available telecom fixture types."""
    return jsonify(FIXTURE_TYPES), 200


@fixtures_bp.route('/', methods=['POST'])
@jwt_required()
def create_fixture():
    identity = get_jwt_identity()
    if identity['role'] == 'requester':
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    fixture = Fixture(
        type=data.get('type'),
        location=data.get('location'),
        related_ticket_id=data.get('related_ticket_id')
    )
    db.session.add(fixture)
    db.session.commit()
    return jsonify(fixture.to_dict()), 201


@fixtures_bp.route('/<int:fixture_id>', methods=['PUT'])
@jwt_required()
def update_fixture(fixture_id):
    identity = get_jwt_identity()
    if identity['role'] == 'requester':
        return jsonify({'error': 'Access denied'}), 403

    fixture = Fixture.query.get_or_404(fixture_id)
    data = request.get_json()

    if 'type' in data:
        fixture.type = data['type']
    if 'location' in data:
        fixture.location = data['location']
    if 'related_ticket_id' in data:
        fixture.related_ticket_id = data['related_ticket_id']

    db.session.commit()
    return jsonify(fixture.to_dict()), 200


@fixtures_bp.route('/<int:fixture_id>', methods=['DELETE'])
@jwt_required()
def delete_fixture(fixture_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    fixture = Fixture.query.get_or_404(fixture_id)
    db.session.delete(fixture)
    db.session.commit()
    return jsonify({'message': 'Fixture deleted'}), 200
