# Minimal Flask app for Railway deployment
import os
from flask import Flask, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

@app.route('/api/health')
def health():
    return jsonify({"status": "ok"}), 200

@app.route('/')
def root():
    return jsonify({"message": "Star Backend API", "version": "1.0.0"}), 200

# Direct entry point
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)