from functools import wraps
from datetime import datetime, timedelta, timezone
from flask import request, current_app
import jwt


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
            # Application should provide a 'users_container' or DB access on the app module
            from .main import users_container
            user_data = list(users_container.query_items(
                query="SELECT * FROM c WHERE c.id = @user_id",
                parameters=[{"name": "@user_id", "value": str(data['user_id'])}],
                enable_cross_partition_query=True
            ))
            if not user_data:
                return {'error': 'User not found'}, 401
            current_user = type('User', (), {'id': user_data[0]['id'], 'username': user_data[0].get('username'), 'zodiac_sign': user_data[0].get('zodiac_sign')})
            # Update last seen
            from .main import update_user_online_status
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
