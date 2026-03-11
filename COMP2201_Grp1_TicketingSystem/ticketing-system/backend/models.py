"""
Database Models — matches Ticketing System Specification Section 3:
Tables: Tickets, Users, Fixtures, Audit/Logs
"""

from extensions import db
from datetime import datetime


class User(db.Model):
    """
    Users table — spec Section 3:
    ID, name, email, password_hash, role (admin, staff, requester)
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'staff', 'requester'), nullable=False, default='requester')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tickets_raised = db.relationship('Ticket', foreign_keys='Ticket.requester_id', backref='requester', lazy=True)
    tickets_assigned = db.relationship('Ticket', foreign_keys='Ticket.assigned_to', backref='assignee', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }


class Ticket(db.Model):
    """
    Tickets table — spec Section 3:
    ID, title, description, requester, priority, status, created_at, updated_at
    Lifecycle — spec Section 5: New → Assigned → In Progress → Resolved → Closed
    """
    __tablename__ = 'tickets'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requester_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    priority = db.Column(db.Enum('low', 'medium', 'high', 'critical'), nullable=False, default='medium')
    # Ticket lifecycle per spec Section 5
    status = db.Column(
        db.Enum('New', 'Assigned', 'In Progress', 'Resolved', 'Closed'),
        nullable=False,
        default='New'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fixture = db.relationship('Fixture', backref='ticket', uselist=False)
    logs = db.relationship('AuditLog', backref='ticket', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'requester_id': self.requester_id,
            'requester_name': self.requester.name if self.requester else None,
            'assigned_to': self.assigned_to,
            'assignee_name': self.assignee.name if self.assignee else None,
            'priority': self.priority,
            'status': self.status,
            'fixture': self.fixture.to_dict() if self.fixture else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Fixture(db.Model):
    """
    Fixtures table — spec Section 3:
    ID, type, location, related_ticket_id
    Telecom fixtures: 5G Towers, Fiber Nodes, Signal Boosters, etc.
    """
    __tablename__ = 'fixtures'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(100), nullable=False)  # e.g. "5G Tower", "Fiber Node"
    location = db.Column(db.String(255), nullable=False)
    related_ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'location': self.location,
            'related_ticket_id': self.related_ticket_id
        }


class AuditLog(db.Model):
    """
    Audit/Logs table — spec Section 3 & 6:
    ID, ticket_id, user_id, action, timestamp
    Tracks all status changes for transparency and accountability.
    """
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='logs')

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'action': self.action,
            'timestamp': self.timestamp.isoformat()
        }
