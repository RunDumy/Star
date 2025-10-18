from flask import Blueprint, request, jsonify
from supabase import create_client
import os

analytics_bp = Blueprint("analytics", __name__)
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

@analytics_bp.route("/events", methods=["POST"])
def log_event():
    try:
        data = request.get_json()
        supabase.table("analytics").insert(data).execute()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
