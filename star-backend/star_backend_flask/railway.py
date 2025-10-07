# Wrapper file for Railway deployment
# This file imports the Flask app instance from app_simple.py
# and exposes it as 'app' for Railway to use

try:
    from .app_simple import app
except ImportError:
    from app_simple import app

if __name__ == '__main__':
    # This block won't be executed when imported by gunicorn
    # but would be useful for local development
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)