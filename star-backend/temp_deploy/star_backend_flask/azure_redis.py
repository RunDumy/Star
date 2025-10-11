"""
Azure Redis Cache utilities for STAR backend
Provides enhanced Redis client management for Azure Cache for Redis
"""

import json
import logging
import os
import time
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urlparse

import redis
from redis.exceptions import ConnectionError, TimeoutError

# Import monitoring if available
try:
    from star_backend_flask.monitoring import Metrics
    has_metrics = True
except ImportError:
    has_metrics = False

logger = logging.getLogger(__name__)

class AzureRedisManager:
    """Enhanced Redis manager for Azure Cache for Redis"""

    def __init__(self, redis_url: Optional[str] = None, ssl: bool = True):
        self.redis_url = redis_url or os.environ.get('AZURE_REDIS_URL')
        self.ssl = ssl
        self.client: Optional[redis.Redis] = None
        self.connection_errors = 0
        self.last_reconnect_attempt = 0
        self.reconnect_interval = 5  # seconds
        
        # Azure Redis specific configurations
        self.retry_count = 3
        self.retry_delay = 0.5  # seconds
        
        if self.redis_url:
            self._connect()

    def _connect(self) -> None:
        """Establish Redis connection with Azure-specific configurations"""
        try:
            parsed = urlparse(self.redis_url)
            
            # Azure Redis Cache requires SSL by default
            self.client = redis.Redis(
                host=parsed.hostname,
                port=parsed.port or 6380,  # Azure Redis default SSL port is 6380
                username=parsed.username,
                password=parsed.password,
                ssl=self.ssl,
                decode_responses=True,
                socket_connect_timeout=10,
                socket_timeout=10,
                retry_on_timeout=True,
                max_connections=50,  # Connection pool size
                health_check_interval=30  # Seconds between health checks
            )
            
            # Test connection
            self.client.ping()
            self.connection_errors = 0
            logger.info("Azure Redis Cache connected successfully")
        except Exception as e:
            logger.warning(f"Failed to connect to Azure Redis Cache: {e}")
            self.connection_errors += 1
            self.client = None

    def _ensure_connection(self) -> bool:
        """Ensure Redis connection is active, reconnect if needed"""
        if self.client and self.is_connected():
            return True
            
        # Check if we should attempt reconnection
        current_time = time.time()
        if current_time - self.last_reconnect_attempt < self.reconnect_interval:
            return False
            
        self.last_reconnect_attempt = current_time
        logger.info("Attempting to reconnect to Azure Redis Cache...")
        self._connect()
        return self.is_connected()

    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if not self.client:
            return False
        try:
            self.client.ping()
            return True
        except (ConnectionError, TimeoutError):
            return False

    def _execute_with_retry(self, operation, *args, **kwargs):
        """Execute Redis operation with retry logic"""
        start_time = time.time()
        
        for attempt in range(self.retry_count):
            if not self._ensure_connection():
                time.sleep(self.retry_delay * (attempt + 1))
                continue
                
            try:
                result = operation(*args, **kwargs)
                
                # Record metrics if available
                if has_metrics:
                    latency_ms = (time.time() - start_time) * 1000
                    Metrics.record_redis_latency(latency_ms)
                    
                return result
            except (ConnectionError, TimeoutError) as e:
                logger.warning(f"Redis operation failed (attempt {attempt+1}/{self.retry_count}): {e}")
                self.connection_errors += 1
                time.sleep(self.retry_delay * (attempt + 1))
                continue
            except Exception as e:
                logger.error(f"Redis operation error: {e}")
                
                # Record metrics if available
                if has_metrics:
                    latency_ms = (time.time() - start_time) * 1000
                    Metrics.record_redis_latency(latency_ms)
                    
                raise
        
        # All retries failed
        logger.error(f"Redis operation failed after {self.retry_count} retries")
        
        # Record metrics if available
        if has_metrics:
            latency_ms = (time.time() - start_time) * 1000
            Metrics.record_redis_latency(latency_ms)
            
        return None

    def get(self, key: str) -> Optional[str]:
        """Get value from Redis with retry logic"""
        if not self.client:
            return None
        
        return self._execute_with_retry(
            lambda: self.client.get(key)
        )

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """Set value in Redis with retry logic"""
        if not self.client:
            return False
            
        result = self._execute_with_retry(
            lambda: self.client.set(key, value, ex=ex)
        )
        return bool(result)

    def delete(self, key: str) -> bool:
        """Delete key from Redis with retry logic"""
        if not self.client:
            return False
            
        result = self._execute_with_retry(
            lambda: self.client.delete(key)
        )
        return bool(result)

    def set_json(self, key: str, data: Any, ex: Optional[int] = None) -> bool:
        """Set JSON data in Redis with retry logic"""
        try:
            json_data = json.dumps(data)
            return self.set(key, json_data, ex=ex)
        except (TypeError, ValueError) as e:
            logger.error(f"JSON serialization error: {e}")
            return False

    def get_json(self, key: str) -> Optional[Any]:
        """Get JSON data from Redis with retry logic"""
        value = self.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError as e:
                logger.warning(f"Redis JSON decode error for key {key}: {e}")
        return None

    def mget(self, keys: List[str]) -> List[Optional[str]]:
        """Get multiple values from Redis with retry logic"""
        if not self.client or not keys:
            return [None] * len(keys)
            
        return self._execute_with_retry(
            lambda: self.client.mget(keys)
        ) or [None] * len(keys)

    def mset(self, mapping: Dict[str, str]) -> bool:
        """Set multiple values in Redis with retry logic"""
        if not self.client or not mapping:
            return False
            
        result = self._execute_with_retry(
            lambda: self.client.mset(mapping)
        )
        return bool(result)

    def publish(self, channel: str, message: str) -> bool:
        """Publish message to Redis channel with retry logic"""
        if not self.client:
            return False
            
        result = self._execute_with_retry(
            lambda: self.client.publish(channel, message)
        )
        return bool(result)

    def expire(self, key: str, time: int) -> bool:
        """Set expiration time for key with retry logic"""
        if not self.client:
            return False
            
        result = self._execute_with_retry(
            lambda: self.client.expire(key, time)
        )
        return bool(result)
        
    def flushdb(self) -> bool:
        """Clear the current database with retry logic"""
        if not self.client:
            return False
            
        result = self._execute_with_retry(
            lambda: self.client.flushdb()
        )
        return bool(result)

    def health_check(self) -> Dict[str, Any]:
        """Perform a health check and return status information"""
        status = {
            "connected": False,
            "latency_ms": None,
            "connection_errors": self.connection_errors,
            "error": None
        }
        
        if not self.client:
            status["error"] = "No Redis client initialized"
            return status
            
        try:
            start_time = time.time()
            self.client.ping()
            status["connected"] = True
            status["latency_ms"] = (time.time() - start_time) * 1000
        except Exception as e:
            status["error"] = str(e)
            
        return status

# Global Azure Redis manager instance
azure_redis_manager = AzureRedisManager()

def init_azure_redis(redis_url: Optional[str] = None, ssl: bool = True) -> None:
    """Initialize Azure Redis manager with URL"""
    global azure_redis_manager
    azure_redis_manager = AzureRedisManager(redis_url, ssl)

def get_azure_redis() -> AzureRedisManager:
    """Get Azure Redis manager instance"""
    return azure_redis_manager