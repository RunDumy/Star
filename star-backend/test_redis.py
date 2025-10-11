"""
Test Redis connection for Star backend
Verifies connectivity to the Redis Cloud instance

Usage:
    python test_redis.py
"""

import os
import redis
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Redis Cloud connection details
REDIS_URL = "redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341"

def test_redis_connection():
    """Test Redis Cloud connectivity"""
    logger.info("Testing Redis connection...")
    
    try:
        # Connect to Redis using URL
        client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        
        # Try ping
        result = client.ping()
        logger.info(f"Redis ping: {result}")
        
        # Set test value
        test_key = "test_key"
        test_value = "test_value"
        client.set(test_key, test_value)
        logger.info(f"Set test key '{test_key}' to '{test_value}'")
        
        # Get test value
        retrieved_value = client.get(test_key)
        logger.info(f"Retrieved test key '{test_key}': '{retrieved_value}'")
        
        if retrieved_value == test_value:
            logger.info("✅ Redis connection test PASSED!")
            return True
        else:
            logger.error(f"❌ Redis test FAILED! Values don't match: '{retrieved_value}' != '{test_value}'")
            return False
            
    except Exception as e:
        logger.error(f"❌ Redis connection test FAILED with error: {e}")
        return False

if __name__ == "__main__":
    test_redis_connection()