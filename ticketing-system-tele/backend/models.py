"""
Database Models — Spec §3
Tables: Tickets, Users, Fixtures, Audit/Logs
"""
from extensions import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'users'

    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role          = db.Column(db.Enum('admin', 'staff', 'requester'), nullable=False, default='requester')
    is_active     = db.Column(db.Integer, nullable=False, default=1)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    tickets_raised   = db.relationship('Ticket', foreign_keys='Ticket.requester_id', backref='requester', lazy=True)
    tickets_assigned = db.relationship('Ticket', foreign_keys='Ticket.assigned_to',  backref='assignee',  lazy=True)

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'email':      self.email,
            'role':       self.role,
            'is_active':  self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Ticket(db.Model):
    __tablename__ = 'tickets'

    id               = db.Column(db.Integer, primary_key=True)
    title            = db.Column(db.String(255), nullable=False)
    description      = db.Column(db.Text, nullable=False)
    requester_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    fixture_id       = db.Column(db.Integer, db.ForeignKey('fixtures.id'), nullable=True)
    # Spec §3 — priority field; Critical added for telecom severity
    priority         = db.Column(db.Enum('Low', 'Medium', 'High', 'Critical'), nullable=False, default='Medium')
    status           = db.Column(
        db.Enum('New', 'Assigned', 'In Progress', 'Resolved', 'Closed'),
        nullable=False, default='New'
    )
    resolution_notes = db.Column(db.Text, nullable=True)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at       = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fixture = db.relationship('Fixture', foreign_keys=[fixture_id], backref='ticket', uselist=False)
    logs    = db.relationship('AuditLog', backref='ticket', lazy=True)

    def to_dict(self):
        return {
            'id':               self.id,
            'title':            self.title,
            'description':      self.description,
            'requester_id':     self.requester_id,
            'requester_name':   self.requester.name  if self.requester else None,
            'assigned_to':      self.assigned_to,
            'assignee_name':    self.assignee.name   if self.assignee  else None,
            'fixture_id':       self.fixture_id,
            'fixture':          self.fixture.to_dict() if self.fixture else None,
            'priority':         self.priority,
            'status':           self.status,
            'resolution_notes': self.resolution_notes,
            'created_at':       self.created_at.isoformat() if self.created_at else None,
            'updated_at':       self.updated_at.isoformat() if self.updated_at else None,
        }


class Fixture(db.Model):
    __tablename__ = 'fixtures'

    id                = db.Column(db.Integer, primary_key=True)
    type              = db.Column(db.String(100), nullable=False)
    location          = db.Column(db.String(255), nullable=False)
    related_ticket_id = db.Column(db.Integer, nullable=True)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':                self.id,
            'type':              self.type,
            'location':          self.location,
            'related_ticket_id': self.related_ticket_id,
            'created_at':        self.created_at.isoformat() if self.created_at else None,
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id        = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id   = db.Column(db.Integer, db.ForeignKey('users.id'),   nullable=False)
    action    = db.Column(db.String(255), nullable=False)
    old_value = db.Column(db.Text, nullable=True)
    new_value = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='logs')

    def to_dict(self):
        return {
            'id':        self.id,
            'ticket_id': self.ticket_id,
            'user_id':   self.user_id,
            'user_name': self.user.name if self.user else None,
            'action':    self.action,
            'old_value': self.old_value,
            'new_value': self.new_value,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
        }
