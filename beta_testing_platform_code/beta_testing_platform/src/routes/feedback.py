from flask import Blueprint, jsonify, request
from src.models.feedback import Feedback, db
import os
import json
from datetime import datetime

# Try to import gspread, but make it optional for deployment
try:
    import gspread
    GSPREAD_AVAILABLE = True
except ImportError:
    GSPREAD_AVAILABLE = False

feedback_bp = Blueprint('feedback', __name__)

# Google Sheets configuration
SPREADSHEET_NAME = 'Beta Tester Feedback'

def append_to_google_sheet(feedback_data):
    """Append feedback data to Google Sheets"""
    if not GSPREAD_AVAILABLE:
        print("gspread not available - skipping Google Sheets sync")
        return False
        
    try:
        # Get service account credentials from environment variable
        service_account_json = os.getenv('GOOGLE_SERVICE_ACCOUNT')
        if not service_account_json:
            print("GOOGLE_SERVICE_ACCOUNT environment variable not set")
            return False
            
        # Parse the JSON string from environment variable
        service_account_info = json.loads(service_account_json)
            
        # Authenticate with Google Sheets using credentials dict
        gc = gspread.service_account_from_dict(service_account_info)
        
        # Open the spreadsheet
        spreadsheet = gc.open(SPREADSHEET_NAME)
        worksheet = spreadsheet.sheet1
        
        # Prepare row data
        row_data = [
            feedback_data['timestamp'],
            feedback_data['tester_name'],
            feedback_data['submission_type'],
            feedback_data['title'],
            feedback_data['description'],
            feedback_data.get('severity', ''),
            feedback_data.get('status', 'New')
        ]
        
        # Append the row
        worksheet.append_row(row_data)
        return True
        
    except Exception as e:
        print(f"Error appending to Google Sheets: {e}")
        return False

@feedback_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    """Submit new feedback/bug report/progress update"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['tester_name', 'submission_type', 'title', 'description']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create feedback record
        feedback = Feedback(
            tester_name=data['tester_name'],
            submission_type=data['submission_type'],
            title=data['title'],
            description=data['description'],
            severity=data.get('severity'),
            status=data.get('status', 'New')
        )
        
        # Save to database
        db.session.add(feedback)
        db.session.commit()
        
        # Prepare data for Google Sheets
        feedback_data = {
            'timestamp': feedback.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'tester_name': feedback.tester_name,
            'submission_type': feedback.submission_type,
            'title': feedback.title,
            'description': feedback.description,
            'severity': feedback.severity or '',
            'status': feedback.status
        }
        
        # Append to Google Sheets
        sheets_success = append_to_google_sheet(feedback_data)
        
        response_data = feedback.to_dict()
        response_data['sheets_synced'] = sheets_success
        
        return jsonify(response_data), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/feedback', methods=['GET'])
def get_feedback():
    """Get all feedback entries"""
    try:
        feedback_entries = Feedback.query.order_by(Feedback.timestamp.desc()).all()
        return jsonify([entry.to_dict() for entry in feedback_entries])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/feedback/<int:feedback_id>', methods=['GET'])
def get_feedback_by_id(feedback_id):
    """Get specific feedback entry"""
    try:
        feedback = Feedback.query.get_or_404(feedback_id)
        return jsonify(feedback.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

