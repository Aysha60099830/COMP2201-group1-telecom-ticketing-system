"""
Ticketing System - Flask Backend
COMP2201 Technical Project | Grp_1: Ticketing System (Telecommunication)
Supervisor: Dr. Ali Khalil
"""

from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, jwt, bcrypt
from routes.auth import auth_bp
from routes.tickets import tickets_bp
from routes.users import users_bp
from routes.fixtures import fixtures_bp
from routes.dashboard import dashboard_bp
from routes.logs import logs_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tickets_bp, url_prefix='/api/tickets')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(fixtures_bp, url_prefix='/api/fixtures')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(logs_bp, url_prefix='/api/logs')

    with app.app_context():
        db.create_all()
        seed_data()

    return app

def seed_data():
    """Seed initial admin user if not exists."""
    from models import User
    from extensions import bcrypt
    if not User.query.filter_by(email='admin@telecom.qa').first():
        admin = User(
            name='System Admin',
            email='admin@telecom.qa',
            password_hash=bcrypt.generate_password_hash('Admin@1234').decode('utf-8'),
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin user seeded.")

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
