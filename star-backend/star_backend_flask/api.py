from flask import Blueprint, jsonify, g
from supabase import create_client
import os
import logging

api_bp = Blueprint("api", __name__)
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
logger = logging.getLogger(__name__)

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
