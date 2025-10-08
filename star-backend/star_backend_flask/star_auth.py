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
            # Application should provide a 'supabase' or DB access on the app module
            supabase = app.extensions.get('supabase') if hasattr(app, 'extensions') else None
            # Fallback to reading from global if present
            from .main import supabase as global_supabase
            supabase = supabase or global_supabase
            user_res = supabase.table('user').select('*').eq('id', data['user_id']).execute()
            user_data = user_res.data or []
            if not user_data:
                return {'error': 'User not found'}, 401
            current_user = type('User', (), {'id': user_data[0]['id'], 'username': user_data[0].get('username'), 'zodiac_sign': user_data[0].get('zodiac_sign')})
            supabase.table('user').update({'last_seen': datetime.now(timezone.utc).isoformat()}).eq('id', current_user.id).execute()
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
