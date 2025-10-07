#!/bin/bash
# Railway deployment script for Star backend

set -e  # Exit on any error

echo "Starting Star backend deployment..."

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Test Redis connection
echo "Testing Redis connection..."
python -c "
import os
import redis
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('redis_test')

redis_url = os.environ.get('REDIS_URL')
logger.info(f'Redis URL set: {bool(redis_url)}')

try:
    client = redis.Redis.from_url(redis_url, decode_responses=True)
    ping_result = client.ping()
    logger.info(f'Redis ping successful: {ping_result}')
    
    # Try simple set/get operation
    client.set('railway_test_key', 'railway_test_value')
    result = client.get('railway_test_key')
    logger.info(f'Redis get result: {result}')
    
    if result == 'railway_test_value':
        logger.info('Redis connection verified successfully!')
    else:
        logger.error(f'Redis test failed: {result} != railway_test_value')
except Exception as e:
    logger.error(f'Redis connection error: {e}')
"

# Start the application with Gunicorn
echo "Starting application with Gunicorn..."
exec gunicorn --threads 4 -b 0.0.0.0:$PORT railway:app