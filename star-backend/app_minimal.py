# -*- coding: utf-8 -*-
# Project: Star App - The Cosmic Social Network
# Minimal version for Azure deployment
import json
import logging
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'test-secret-key')
CORS(app, origins=['http://localhost:3000'])

# Import our core modules
try:
    from cosmos_db import get_cosmos_helper
    from oracle_engine import OccultOracleEngine
    oracle_available = True
    logger.info("Oracle engine and Cosmos DB loaded successfully")
except ImportError as e:
    logger.error(f"Failed to import core modules: {e}")
    oracle_available = False

@app.route('/')
def hello():
    return "Star App Backend - Azure Deployment"

@app.route('/api/health')
def health():
    return {
        "status": "healthy",
        "message": "Star App Backend is running on Azure",
        "oracle_available": oracle_available,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.route('/api/oracle/natal-chart', methods=['POST'])
def get_natal_chart():
    if not oracle_available:
        return jsonify({"error": "Oracle engine not available"}), 503

    try:
        data = request.get_json()
        birth_date = data.get('birth_date')
        birth_time = data.get('birth_time')
        location = data.get('location')

        if not all([birth_date, birth_time, location]):
            return jsonify({"error": "Missing required fields: birth_date, birth_time, location"}), 400

        oracle = OccultOracleEngine()
        chart = oracle.calculate_natal_chart(birth_date, birth_time, location)

        return jsonify({
            "success": True,
            "chart": chart
        })
    except Exception as e:
        logger.error(f"Error calculating natal chart: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/oracle/tarot', methods=['POST'])
def get_tarot_reading():
    if not oracle_available:
        return jsonify({"error": "Oracle engine not available"}), 503

    try:
        data = request.get_json()
        question = data.get('question', 'General guidance')

        oracle = OccultOracleEngine()
        reading = oracle.draw_tarot_cards(question)

        return jsonify({
            "success": True,
            "reading": reading
        })
    except Exception as e:
        logger.error(f"Error getting tarot reading: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/oracle/numerology', methods=['POST'])
def get_numerology():
    if not oracle_available:
        return jsonify({"error": "Oracle engine not available"}), 503

    try:
        data = request.get_json()
        birth_date = data.get('birth_date')
        name = data.get('name')

        if not birth_date:
            return jsonify({"error": "Missing required field: birth_date"}), 400

        oracle = OccultOracleEngine()
        numerology = oracle.calculate_numerology(birth_date, name)

        return jsonify({
            "success": True,
            "numerology": numerology
        })
    except Exception as e:
        logger.error(f"Error calculating numerology: {e}")
        return jsonify({"error": str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting Star App server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)