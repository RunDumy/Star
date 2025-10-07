# Simple health check app.py for troubleshooting
import os
import logging
import json
from flask import Flask, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="*")

@app.route('/api/health')
def health():
    """Health check endpoint for Railway."""
    logger.info("Health check endpoint called")
    return jsonify({"status": "ok"}), 200

@app.route('/')
def root():
    """Root endpoint."""
    logger.info("Root endpoint called")
    return jsonify({"message": "Star Backend API", "version": "1.0.0"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)