import logging

from flask import Blueprint, g, jsonify

api_bp = Blueprint("api", __name__)
logger = logging.getLogger(__name__)

# Supabase client will be set from main app
supabase = None

def init_api_blueprint(supabase_client):
    global supabase
    supabase = supabase_client

@api_bp.route("/test", methods=["GET"])
def test_endpoint():
    return jsonify({"status": "success", "message": "API blueprint is working"}), 200

@api_bp.route("/compatibility", methods=["GET"])
def get_compatibility():
    try:
        user_id = g.current_user
        profile = supabase.table("profiles").select("customizations").eq("userId", user_id).execute().data[0]
        zodiac = profile["customizations"]["zodiacIcon"]
        return jsonify({"status": "success", "zodiac": zodiac}), 200
    except Exception as e:
        logger.error(f"Compatibility error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@api_bp.route("/notifications", methods=["GET"])
def get_notifications():
    try:
        user_id = g.current_user
        notifications = supabase.table("analytics").select("*").eq("userId", user_id).execute().data
        return jsonify({"status": "success", "notifications": notifications}), 200
    except Exception as e:
        logger.error(f"Notifications error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500
