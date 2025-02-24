from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, timedelta
import threading
import time
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from geopy.distance import geodesic
import signal
import sys

# Initialize the application
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reports.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database and migration
from models import db, User, Report
db.init_app(app)
migrate = Migrate(app, db)

# Set up logging
logging.basicConfig(level=logging.INFO)

# ---------------------------
# Background Task: Delete Expired Reports
# ---------------------------
def delete_expired_reports():
    while True:
        try:
            with app.app_context():
                ten_minutes_ago = datetime.utcnow() - timedelta(minutes=10)
                Report.query.filter(Report.timestamp < ten_minutes_ago).delete()
                db.session.commit()
                logging.info("Expired reports deleted successfully.")
        except Exception as e:
            logging.error(f"Error deleting expired reports: {e}")
        time.sleep(60)  # Check every 60 seconds

# ---------------------------
# Routes
# ---------------------------

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    required_fields = ("drivername", "email", "vehicleno", "telegram_phone", "password")
    if not all(key in data for key in required_fields):
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400

    new_user = User(
        drivername=data['drivername'],
        email=data['email'],
        vehicleno=data['vehicleno'],
        telegram_phone=data['telegram_phone']
    )
    new_user.set_password(data['password'])

    db.session.add(new_user)
    db.session.commit()

    response_data = {
        "message": "User registered successfully!"
    }

    return jsonify(response_data), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    required_fields = ['email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        response_data = {"message": "Login successful!"}
        return jsonify(response_data), 200

    return jsonify({"error": "Invalid credentials"}), 401


@app.route('/report', methods=['POST'])
def create_report():
    data = request.get_json()

    required_fields = ['issue_type', 'latitude', 'longitude', 'subject']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    new_report = Report(
        issue_type=data['issue_type'].strip(),
        latitude=float(data['latitude']),
        longitude=float(data['longitude']),
        subject=data['subject'].strip()
    )

    db.session.add(new_report)
    db.session.commit()

    response_data = {
        "message": "Report submitted successfully!",
        "id": new_report.id
    }

    return jsonify(response_data), 201


@app.route('/reports', methods=['GET'])
def get_reports():
    ten_minutes_ago = datetime.utcnow() - timedelta(minutes=10)
    reports = Report.query.filter(Report.timestamp >= ten_minutes_ago).all()

    response_data = [
        {
            "id": r.id,
            "issue": r.issue_type,
            "subject": r.subject,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "timestamp": r.timestamp,
            "confirmed": r.confirmed
        } for r in reports
    ]

    return jsonify(response_data), 200


@app.route('/report/<int:report_id>/confirm', methods=['PUT'])
def confirm_report(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404

    if report.confirmed:
        return jsonify({"message": f"Report {report_id} has already been confirmed!"}), 400

    report.confirmed = True
    db.session.commit()

    response_data = {
        "message": f"Report {report_id} confirmed!",
        "confirmed": report.confirmed
    }

    return jsonify(response_data), 200


@app.route('/report/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404

    db.session.delete(report)
    db.session.commit()

    response_data = {
        "message": f"Report {report_id} deleted successfully!"
    }

    return jsonify(response_data), 200


@app.route('/acn', methods=['GET'])
def acn_route():
    current_lat = request.args.get('latitude', type=float)
    current_lon = request.args.get('longitude', type=float)
    if current_lat is None or current_lon is None:
        return jsonify({"error": "Latitude and longitude parameters are required"}), 400

    ten_minutes_ago = datetime.utcnow() - timedelta(minutes=10)
    reports = Report.query.filter(Report.timestamp >= ten_minutes_ago).all()

    acn_results = []
    for report in reports:
        distance = geodesic((current_lat, current_lon), (report.latitude, report.longitude)).km
        weight = max(0, 10 - distance * 2)  # Adjust for desired weight formula
        acn_results.append({
            "report_id": report.id,
            "issue_type": report.issue_type,
            "subject": report.subject,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "timestamp": report.timestamp,
            "weight": round(weight, 2)
        })

    response_data = {
        "current_location": [current_lat, current_lon],
        "acn_reports": acn_results
    }

    return jsonify(response_data), 200

# ---------------------------
# Signal Handling for Graceful Shutdown
# ---------------------------
def signal_handler(sig, frame):
    print('Shutting down gracefully...')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# ---------------------------
# Run the Application
# ---------------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    cleanup_thread = threading.Thread(target=delete_expired_reports, daemon=True)
    cleanup_thread.start()

    app.run(debug=True)
