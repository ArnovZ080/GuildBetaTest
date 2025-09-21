from flask import Blueprint, jsonify, request, session
import hashlib

auth_bp = Blueprint('auth', __name__)

# Simple hardcoded beta tester credentials (in production, use a proper database)
BETA_TESTERS = {
    'tester1': 'password123',
    'tester2': 'password456',
    'tester3': 'password789',
    'admin': 'admin123'
}

def hash_password(password):
    """Simple password hashing (in production, use proper hashing like bcrypt)"""
    return hashlib.sha256(password.encode()).hexdigest()

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate beta tester"""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        # Check credentials
        if username in BETA_TESTERS and BETA_TESTERS[username] == password:
            # Create session
            session['user'] = username
            session['authenticated'] = True
            
            return jsonify({
                'message': 'Login successful',
                'username': username,
                'session_id': session.get('_id', 'session_active')
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout beta tester"""
    try:
        session.clear()
        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/status', methods=['GET'])
def status():
    """Check authentication status"""
    try:
        if session.get('authenticated'):
            return jsonify({
                'authenticated': True,
                'username': session.get('user')
            }), 200
        else:
            return jsonify({'authenticated': False}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def require_auth(f):
    """Decorator to require authentication for routes"""
    def decorated_function(*args, **kwargs):
        if not session.get('authenticated'):
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

