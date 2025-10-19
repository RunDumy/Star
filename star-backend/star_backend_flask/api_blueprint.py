import logging

from flask import Blueprint, g, jsonify, request

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

@api_bp.route("/zodiac-arena/leaderboard", methods=["POST"])
def update_leaderboard():
    try:
        data = request.get_json()
        leaderboard = {
            'id': f"score-{data['user_id']}-{data['timestamp']}",
            'user_id': data['user_id'],
            'score': data['score'],
            'timestamp': data['timestamp']
        }
        supabase.table('leaderboard').insert(leaderboard).execute()
        return jsonify({'status': 'success', 'score': data['score']}), 200
    except Exception as e:
        logger.error(f"Leaderboard update failed: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@api_bp.route("/zodiac-arena/store", methods=["POST"])
def store_purchase():
    try:
        data = request.get_json()
        purchase = {
            'id': f"purchase-{data['user_id']}-{data['timestamp']}",
            'user_id': data['user_id'],
            'item_id': data['item_id'],
            'type': data['type'],
            'value': data['value'],
            'timestamp': data['timestamp']
        }
        supabase.table('store').insert(purchase).execute()
        return jsonify({'status': 'success', 'item_id': data['item_id']}), 200
    except Exception as e:
        logger.error(f"Store purchase failed: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
