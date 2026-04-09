"""
Flask Backend

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

    # Full CORS — allow all origins, headers, methods
    CORS(app,
         resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(tickets_bp,   url_prefix='/api/tickets')
    app.register_blueprint(users_bp,     url_prefix='/api/users')
    app.register_blueprint(fixtures_bp,  url_prefix='/api/fixtures')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(logs_bp,      url_prefix='/api/logs')

    with app.app_context():
        seed_admin()

    return app


def seed_admin():
    """Create default admin account if not present."""
    try:
        from models import User
        if not User.query.filter_by(email='admin@telecom.qa').first():
            admin = User(
                name          = 'System Admin',
                email         = 'admin@telecom.qa',
                password_hash = bcrypt.generate_password_hash('Admin@1234').decode('utf-8'),
                role          = 'admin',
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user seeded: admin@telecom.qa / Admin@1234")
        else:
            print("✅ Database connected. Admin user already exists.")
    except Exception as e:
        print(f"⚠️  Could not seed admin: {e}")


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)


# WSGI entry point for gunicorn
application = create_app