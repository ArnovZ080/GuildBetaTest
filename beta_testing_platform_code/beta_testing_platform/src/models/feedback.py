from src.models.user import db
from datetime import datetime

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tester_name = db.Column(db.String(100), nullable=False)
    submission_type = db.Column(db.String(50), nullable=False)  # Bug, Feedback, Progress
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), nullable=True)  # Low, Medium, High, Critical
    status = db.Column(db.String(20), default='New')  # New, In Progress, Resolved
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'tester_name': self.tester_name,
            'submission_type': self.submission_type,
            'title': self.title,
            'description': self.description,
            'severity': self.severity,
            'status': self.status,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

