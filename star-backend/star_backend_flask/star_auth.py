from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, request


def token_required(f):
    """Canonical token_required decorator.

    When used on instance methods, the wrapped function will receive (self, current_user, ...).
    When used on plain functions (view functions), the wrapped function will receive (current_user, ...).
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        app = current_app
        if 'Authorization' not in request.headers or not request.headers['Authorization'].startswith('Bearer '):
            return {'error': 'Invalid or missing Authorization header'}, 401
        try:
            token = request.headers['Authorization'].split(' ')[1]
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=[app.config.get('JWT_ALGORITHM', 'HS256')])
            # Get user from database using utilities
            from .database_utils import (get_users_container,
                                         update_user_online_status)
            users_table = get_users_container()
            if not users_table:
                return {'error': 'Database not available'}, 500
                
            result = users_table.select('*').eq('id', str(data['user_id'])).execute()
            if not result.data:
                return {'error': 'User not found'}, 401
            user_data = result.data[0]
            current_user = type('User', (), {'id': user_data['id'], 'username': user_data.get('username'), 'zodiac_sign': user_data.get('zodiac_sign')})
            # Update last seen
            update_user_online_status(current_user.username, True)
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Token is invalid'}, 401
        except Exception as e:
            # Avoid importing logger here to keep module minimal; rely on app logging
            print(f"Token validation error: {e}")
            return {'error': 'Internal server error'}, 500

        # If used as instance method, preserve self
        if args:
            return f(args[0], current_user, *args[1:], **kwargs)
        return f(current_user, *args, **kwargs)

    return decorated


def create_token(user_id):
    """Create a JWT token for testing purposes"""
    app = current_app
    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }, app.config['JWT_SECRET_KEY'], algorithm=app.config.get('JWT_ALGORITHM', 'HS256'))
    return token
