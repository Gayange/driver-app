from enum import Enum
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class ReportStatus(Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    REJECTED = "Rejected"

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    drivername = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    vehicleno = db.Column(db.String(20), nullable=False)
    telegram_phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    issue_type = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    confirmed = db.Column(db.Boolean, default=False)
    status = db.Column(db.Enum(ReportStatus), default=ReportStatus.PENDING)  # Store as Enum

    def __repr__(self):
        return f"<Report {self.issue_type} - {self.status.value}>"