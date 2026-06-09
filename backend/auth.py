"""
Authentication utilities for OTP & JWT
⭐ IMPORTANT: Handles phone OTP + JWT for admin
"""

import jwt
import random
import string
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from models import db, Customer, OTPToken, AdminUser
import bcrypt

# ==================== OTP UTILITIES ====================

def generate_otp():
    """Generate 6-digit OTP code"""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_to_phone(phone: str) -> dict:
    """
    ⭐ IMPORTANT: Send OTP via SMS/WhatsApp
    Comment: Integrate with Twilio API
    """
    try:
        from twilio.rest import Client
        
        account_sid = current_app.config['TWILIO_ACCOUNT_SID']
        auth_token = current_app.config['TWILIO_AUTH_TOKEN']
        phone_number = current_app.config['TWILIO_PHONE_NUMBER']
        
        client = Client(account_sid, auth_token)
        
        otp_code = generate_otp()
        message = f"Your New-ERA pastries verification code is: {otp_code}"
        
        # Send SMS
        message_obj = client.messages.create(
            body=message,
            from_=phone_number,
            to=phone
        )
        
        # Save OTP to database
        otp_token = OTPToken(
            phone=phone,
            otp_code=otp_code,
            expires_at=datetime.utcnow() + timedelta(minutes=current_app.config['OTP_EXPIRY_MINUTES'])
        )
        db.session.add(otp_token)
        db.session.commit()
        
        return {'success': True, 'message': 'OTP sent successfully'}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}

def verify_otp(phone: str, otp_code: str) -> tuple:
    """
    ⭐ IMPORTANT: Verify OTP code
    Returns: (success: bool, customer: Customer or None)
    """
    otp_token = OTPToken.query.filter_by(
        phone=phone,
        otp_code=otp_code,
        is_verified=False
    ).first()
    
    if not otp_token:
        return False, None
    
    if otp_token.expires_at < datetime.utcnow():
        return False, None  # OTP expired
    
    # Mark as verified
    otp_token.is_verified = True
    
    # Create or update customer
    customer = Customer.query.filter_by(phone=phone).first()
    if not customer:
        customer = Customer(phone=phone)
        db.session.add(customer)
    
    customer.otp_verified = True
    db.session.commit()
    
    return True, customer

# ==================== JWT UTILITIES ====================

def generate_jwt_token(user_id: int, admin=False) -> str:
    """
    Generate JWT token for admin authentication
    ⭐ IMPORTANT: Used for admin dashboard access
    """
    payload = {
        'user_id': user_id,
        'is_admin': admin,
        'exp': datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )
    
    return token

def verify_jwt_token(token: str) -> dict:
    """
    Verify JWT token and extract payload
    Returns: payload dict or None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256']
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# ==================== DECORATORS ====================

def require_admin_auth(f):
    """
    ⭐ IMPORTANT: Decorator to protect admin endpoints
    Extracts JWT token from Authorization header
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Missing authorization header'}), 401
        
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header'}), 401
        
        payload = verify_jwt_token(token)
        
        if not payload or not payload.get('is_admin'):
            return jsonify({'error': 'Unauthorized'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def require_customer_auth(f):
    """
    ⭐ IMPORTANT: Decorator to protect customer endpoints
    Requires customer to be OTP verified
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Missing authorization header'}), 401
        
        try:
            phone = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header'}), 401
        
        customer = Customer.query.filter_by(phone=phone, otp_verified=True).first()
        
        if not customer:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Store customer in request context
        request.customer = customer
        
        return f(*args, **kwargs)
    
    return decorated_function

# ==================== PASSWORD UTILITIES ====================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode(), password_hash.encode())
