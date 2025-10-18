from flask import Blueprint, jsonify, request

analytics_bp = Blueprint("analytics", __name__)

# Supabase client will be set from main app
supabase = None

def init_analytics_blueprint(supabase_client):
    global supabase
    supabase = supabase_client

@analytics_bp.route("/events", methods=["POST"])
def log_event():
    try:
        data = request.get_json()
        supabase.table("analytics").insert(data).execute()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
