"""
Redis connection test script for Star backend
Tests connection to Redis Cloud instance
"""

import os
import redis
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Redis connection details from environment
REDIS_URL = os.environ.get("REDIS_URL", 
                          "redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341")

def verify_redis_connection():
    """Verify connection to Redis Cloud"""
    logger.info("Verifying Redis connection...")
    
    try:
        # Connect to Redis using URL
        client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        
        # Try ping
        if client.ping():
            logger.info("✅ Redis ping successful")
        else:
            logger.error("❌ Redis ping failed")
            return False
            
        # Set test value
        test_key = "pretty_gentleness_test"
        timestamp = datetime.now().isoformat()
        test_value = f"Redis test at {timestamp}"
        
        client.set(test_key, test_value)
        logger.info(f"Set test key '{test_key}' with timestamp: {timestamp}")
        
        # Get test value
        retrieved_value = client.get(test_key)
        logger.info(f"Retrieved value: '{retrieved_value}'")
        
        if retrieved_value == test_value:
            logger.info("✅ Redis connection test PASSED!")
            return True
        else:
            logger.error("❌ Redis test FAILED - values don't match")
            return False
            
    except Exception as e:
        logger.error(f"❌ Redis connection error: {e}")
        return False

if __name__ == "__main__":
    verify_redis_connection()