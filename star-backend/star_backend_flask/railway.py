# Simple wrapper for Railway deployment
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
import redis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Redis from external Redis Cloud service
redis_url = os.environ.get('REDIS_URL')
redis_client = None

if redis_url:
    try:
        logger.info(f"Connecting to Redis using URL: {redis_url}")
        redis_client = redis.Redis.from_url(redis_url, decode_responses=True)
        # Test the connection
        redis_client.set('railway_health_check', 'ok')
        test_value = redis_client.get('railway_health_check')
        logger.info(f"Redis test: {test_value}")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")

@app.route('/api/health')
def health():
    if redis_client:
        try:
            redis_client.set('health_check', 'ok')
            redis_value = redis_client.get('health_check')
            if redis_value == 'ok':
                return jsonify({"status": "ok", "redis": "connected"}), 200
            else:
                return jsonify({"status": "degraded", "redis": "not working"}), 200
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return jsonify({"status": "degraded", "redis": "error", "error": str(e)}), 200
    return jsonify({"status": "ok", "redis": "not configured"}), 200

@app.route('/')
def root():
    return jsonify({"message": "Star Backend API", "version": "1.0.0"}), 200

@app.route('/api/redis-test')
def redis_test():
    """Test Redis connection"""
    if redis_client:
        try:
            test_key = "api_test_key"
            import datetime
            test_value = f"Redis test at {datetime.datetime.now().isoformat()}"
            
            redis_client.set(test_key, test_value)
            retrieved_value = redis_client.get(test_key)
            
            if retrieved_value == test_value:
                logger.info(f"Redis test successful: {retrieved_value}")
                return jsonify({
                    "status": "ok", 
                    "message": "Redis connection successful",
                    "value": retrieved_value
                }), 200
            else:
                logger.error(f"Redis test failed: retrieved value doesn't match")
                return jsonify({
                    "status": "error", 
                    "message": "Redis test failed: retrieved value doesn't match"
                }), 500
        except Exception as e:
            logger.error(f"Redis test failed with exception: {e}")
            return jsonify({
                "status": "error", 
                "message": f"Redis test exception: {str(e)}"
            }), 500
    return jsonify({
        "status": "error", 
        "message": "Redis not configured"
    }), 404

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)