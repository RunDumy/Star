"""
Redis utilities for STAR backend
Provides Redis client management and common operations
"""

import json
import logging
from typing import Any, Optional
from urllib.parse import urlparse

import redis

logger = logging.getLogger(__name__)

class RedisManager:
    """Redis connection manager for STAR application"""

    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url
        self.client: Optional[redis.Redis] = None

        if redis_url:
            self._connect()

    def _connect(self) -> None:
        """Establish Redis connection"""
        try:
            parsed = urlparse(self.redis_url)
            self.client = redis.Redis(
                host=parsed.hostname,
                port=parsed.port or 6379,
                username=parsed.username,
                password=parsed.password,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Test connection
            self.client.ping()
            logger.info("Redis client connected successfully")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}")
            self.client = None

    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if not self.client:
            return False
        try:
            self.client.ping()
            return True
        except redis.ConnectionError:
            return False

    def get(self, key: str) -> Optional[str]:
        """Get value from Redis"""
        if not self.client:
            return None
        try:
            return self.client.get(key)
        except Exception as e:
            logger.warning(f"Redis GET error for key {key}: {e}")
            return None

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """Set value in Redis with optional expiration"""
        if not self.client:
            return False
        try:
            return self.client.set(key, value, ex=ex)
        except Exception as e:
            logger.warning(f"Redis SET error for key {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete key from Redis"""
        if not self.client:
            return False
        try:
            return bool(self.client.delete(key))
        except Exception as e:
            logger.warning(f"Redis DELETE error for key {key}: {e}")
            return False

    def set_json(self, key: str, data: Any, ex: Optional[int] = None) -> bool:
        """Set JSON data in Redis"""
        return self.set(key, json.dumps(data), ex=ex)

    def get_json(self, key: str) -> Optional[Any]:
        """Get JSON data from Redis"""
        value = self.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError as e:
                logger.warning(f"Redis JSON decode error for key {key}: {e}")
        return None

    def publish(self, channel: str, message: str) -> bool:
        """Publish message to Redis channel"""
        if not self.client:
            return False
        try:
            return bool(self.client.publish(channel, message))
        except Exception as e:
            logger.warning(f"Redis PUBLISH error for channel {channel}: {e}")
            return False

    def expire(self, key: str, time: int) -> bool:
        """Set expiration time for key"""
        if not self.client:
            return False
        try:
            return bool(self.client.expire(key, time))
        except Exception as e:
            logger.warning(f"Redis EXPIRE error for key {key}: {e}")
            return False

# Global Redis manager instance
redis_manager = RedisManager()

def init_redis(redis_url: Optional[str] = None) -> None:
    """Initialize Redis manager with URL"""
    global redis_manager
    redis_manager = RedisManager(redis_url)

def get_redis() -> RedisManager:
    """Get Redis manager instance"""
    return redis_manager