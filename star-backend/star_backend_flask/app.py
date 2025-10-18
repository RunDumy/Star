import logging
import os

from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from supabase import create_client

app = Flask(__name__)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from analytics_api import analytics_bp, init_analytics_blueprint
# Import blueprints
from api_blueprint import api_bp, init_api_blueprint

# Initialize blueprints with Supabase client
init_api_blueprint(supabase)
init_analytics_blueprint(supabase)

app.register_blueprint(api_bp, url_prefix="/api/v1")
app.register_blueprint(analytics_bp, url_prefix="/api/v1")

@app.route("/health")
def health():
    return {"status": "healthy", "version": "1.0.0"}, 200

@app.route("/test-blueprint")
def test_blueprint():
    return {"message": "Blueprint test", "api_bp_registered": "api_bp" in str(app.blueprints)}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
