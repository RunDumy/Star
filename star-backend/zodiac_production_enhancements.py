"""
Production Enhancement Suite for Multi-Zodiac System
Adds robust error handling, logging, caching, and monitoring capabilities
"""

import functools
import json
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Callable, Dict, List, Optional


class LogLevel(Enum):
    """Logging levels for zodiac system"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


@dataclass
class PerformanceMetrics:
    """Performance tracking for zodiac calculations"""
    operation_name: str
    start_time: float
    end_time: float
    duration: float
    success: bool
    error_message: Optional[str] = None
    
    @property
    def duration_ms(self) -> float:
        return self.duration * 1000


class ZodiacSystemLogger:
    """Enhanced logging system for zodiac operations"""
    
    def __init__(self, log_file: str = "zodiac_system.log"):
        self.log_file = log_file
        self._setup_logging()
    
    def _setup_logging(self):
        """Configure comprehensive logging"""
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        
        # Setup file handler
        file_handler = logging.FileHandler(self.log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        file_handler.setLevel(logging.DEBUG)
        
        # Setup console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        console_handler.setLevel(logging.INFO)
        
        # Configure root logger
        self.logger = logging.getLogger('zodiac_system')
        self.logger.setLevel(logging.DEBUG)
        
        # Clear existing handlers and add new ones
        self.logger.handlers.clear()
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def log_zodiac_calculation(self, system: str, birth_data: Dict, result: Dict):
        """Log zodiac calculation with structured data"""
        self.logger.info(
            f"Zodiac calculation completed",
            extra={
                'system': system,
                'birth_date': birth_data.get('birth_date'),
                'calculation_success': bool(result),
                'result_keys': list(result.keys()) if result else []
            }
        )
    
    def log_animation_trigger(self, sign: str, action: str, success: bool):
        """Log animation trigger events"""
        level = logging.INFO if success else logging.WARNING
        message = f"Animation trigger: {sign} -> {action}"
        if success:
            message += " (success)"
        else:
            message += " (failed)"
        
        self.logger.log(level, message, extra={
            'zodiac_sign': sign,
            'action_type': action,
            'trigger_success': success
        })
    
    def log_performance_metric(self, metric: PerformanceMetrics):
        """Log performance metrics"""
        level = logging.INFO if metric.success else logging.WARNING
        
        self.logger.log(level, 
            f"Performance: {metric.operation_name} took {metric.duration_ms:.2f}ms",
            extra={
                'operation': metric.operation_name,
                'duration_ms': metric.duration_ms,
                'success': metric.success,
                'error': metric.error_message
            }
        )


class ZodiacCacheManager:
    """In-memory caching for zodiac calculations"""
    
    def __init__(self, max_size: int = 1000, ttl_minutes: int = 60):
        self.cache: Dict[str, Dict] = {}
        self.timestamps: Dict[str, datetime] = {}
        self.max_size = max_size
        self.ttl = timedelta(minutes=ttl_minutes)
        self.hit_count = 0
        self.miss_count = 0
    
    def _generate_key(self, birth_data: Dict) -> str:
        """Generate cache key from birth data"""
        key_parts = [
            birth_data.get('birth_date', ''),
            birth_data.get('birth_time', ''),
            str(birth_data.get('birth_location', {}))
        ]
        return "|".join(key_parts)
    
    def _is_expired(self, key: str) -> bool:
        """Check if cache entry is expired"""
        if key not in self.timestamps:
            return True
        return datetime.now() - self.timestamps[key] > self.ttl
    
    def _cleanup_expired(self):
        """Remove expired cache entries"""
        expired_keys = [
            key for key in self.timestamps.keys()
            if self._is_expired(key)
        ]
        
        for key in expired_keys:
            self.cache.pop(key, None)
            self.timestamps.pop(key, None)
    
    def get(self, birth_data: Dict) -> Optional[Dict]:
        """Get cached zodiac calculation"""
        key = self._generate_key(birth_data)
        
        if key in self.cache and not self._is_expired(key):
            self.hit_count += 1
            return self.cache[key].copy()
        
        self.miss_count += 1
        return None
    
    def set(self, birth_data: Dict, result: Dict):
        """Cache zodiac calculation result"""
        key = self._generate_key(birth_data)
        
        # Cleanup if cache is full
        if len(self.cache) >= self.max_size:
            self._cleanup_expired()
            
            # If still full, remove oldest entries
            if len(self.cache) >= self.max_size:
                oldest_key = min(self.timestamps.keys(), key=lambda k: self.timestamps[k])
                self.cache.pop(oldest_key, None)
                self.timestamps.pop(oldest_key, None)
        
        self.cache[key] = result.copy()
        self.timestamps[key] = datetime.now()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_requests = self.hit_count + self.miss_count
        hit_rate = (self.hit_count / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'cache_size': len(self.cache),
            'max_size': self.max_size,
            'hit_count': self.hit_count,
            'miss_count': self.miss_count,
            'hit_rate_percent': round(hit_rate, 2),
            'ttl_minutes': self.ttl.total_seconds() / 60
        }


def performance_monitor(operation_name: str):
    """Decorator to monitor function performance"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            success = True
            error_message = None
            result = None
            
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                error_message = str(e)
                raise
            finally:
                end_time = time.time()
                duration = end_time - start_time
                
                metric = PerformanceMetrics(
                    operation_name=operation_name,
                    start_time=start_time,
                    end_time=end_time,
                    duration=duration,
                    success=success,
                    error_message=error_message
                )
                
                # Log performance metric
                logger = ZodiacSystemLogger()
                logger.log_performance_metric(metric)
                
        return wrapper
    return decorator


class ZodiacErrorHandler:
    """Comprehensive error handling for zodiac operations"""
    
    def __init__(self):
        self.error_counts: Dict[str, int] = {}
        self.logger = ZodiacSystemLogger()
    
    def handle_calculation_error(self, system: str, birth_data: Dict, error: Exception) -> Dict:
        """Handle zodiac calculation errors with graceful fallback"""
        error_key = f"{system}_calculation"
        self.error_counts[error_key] = self.error_counts.get(error_key, 0) + 1
        
        self.logger.logger.error(
            f"Zodiac calculation failed for {system}",
            extra={
                'system': system,
                'error_type': type(error).__name__,
                'error_message': str(error),
                'birth_data': birth_data,
                'error_count': self.error_counts[error_key]
            },
            exc_info=True
        )
        
        # Return minimal fallback result
        return {
            'system': system,
            'status': 'error',
            'error_message': f"Calculation temporarily unavailable for {system}",
            'fallback_data': self._generate_fallback_data(system, birth_data)
        }
    
    def _generate_fallback_data(self, system: str, birth_data: Dict) -> Dict:
        """Generate basic fallback data when calculations fail"""
        fallback_data = {
            'birth_date': birth_data.get('birth_date'),
            'system': system,
            'status': 'fallback'
        }
        
        # Add basic system-specific fallbacks
        if system == 'western':
            fallback_data.update({
                'sun_sign': 'Unable to calculate',
                'element': 'Unknown',
                'quality': 'Unknown'
            })
        elif system == 'chinese':
            fallback_data.update({
                'year_animal': 'Unable to calculate',
                'element': 'Unknown'
            })
        elif system in ['mayan', 'aztec']:
            fallback_data.update({
                'day_sign': 'Unable to calculate',
                'galactic_tone': 1
            })
        
        return fallback_data
    
    def get_error_statistics(self) -> Dict[str, Any]:
        """Get error statistics for monitoring"""
        return {
            'error_counts': self.error_counts.copy(),
            'total_errors': sum(self.error_counts.values()),
            'error_types': list(self.error_counts.keys()),
            'timestamp': datetime.now().isoformat()
        }


class ZodiacSystemMonitor:
    """System health monitoring for zodiac operations"""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.operation_count = 0
        self.error_handler = ZodiacErrorHandler()
        self.cache_manager = ZodiacCacheManager()
        self.logger = ZodiacSystemLogger()
    
    def increment_operation_count(self):
        """Track operation count"""
        self.operation_count += 1
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get comprehensive system health metrics"""
        uptime = datetime.now() - self.start_time
        cache_stats = self.cache_manager.get_stats()
        error_stats = self.error_handler.get_error_statistics()
        
        return {
            'system_status': 'healthy',
            'uptime_seconds': uptime.total_seconds(),
            'uptime_formatted': str(uptime),
            'total_operations': self.operation_count,
            'cache_performance': cache_stats,
            'error_statistics': error_stats,
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0'
        }
    
    def log_system_health(self):
        """Log current system health"""
        health = self.get_system_health()
        self.logger.logger.info(
            "System health check",
            extra=health
        )


# Global instances for production use
zodiac_logger = ZodiacSystemLogger()
zodiac_cache = ZodiacCacheManager()
zodiac_error_handler = ZodiacErrorHandler()
zodiac_monitor = ZodiacSystemMonitor()


def main():
    """Demonstrate production enhancement features"""
    print("🔧 Multi-Zodiac System Production Enhancements")
    print("=" * 55)
    
    # Demonstrate logging
    print("\n📝 Enhanced Logging System:")
    zodiac_logger.log_zodiac_calculation(
        'western', 
        {'birth_date': '1990-03-21', 'birth_time': '12:00'}, 
        {'sun_sign': 'Aries', 'element': 'Fire'}
    )
    
    # Demonstrate caching
    print("\n💾 Caching System:")
    birth_data = {'birth_date': '1990-03-21', 'birth_time': '12:00', 'birth_location': {'lat': 40.7128}}
    result = {'sun_sign': 'Aries', 'element': 'Fire'}
    
    # Cache miss
    cached = zodiac_cache.get(birth_data)
    print(f"Cache miss: {cached is None}")
    
    # Set cache
    zodiac_cache.set(birth_data, result)
    
    # Cache hit
    cached = zodiac_cache.get(birth_data)
    print(f"Cache hit: {cached is not None}")
    print(f"Cache stats: {zodiac_cache.get_stats()}")
    
    # Demonstrate error handling
    print("\n🚨 Error Handling System:")
    try:
        raise ValueError("Simulated calculation error")
    except Exception as e:
        error_result = zodiac_error_handler.handle_calculation_error(
            'western', birth_data, e
        )
        print(f"Error handled gracefully: {error_result['status']}")
    
    # System health monitoring
    print("\n📊 System Health Monitoring:")
    zodiac_monitor.increment_operation_count()
    health = zodiac_monitor.get_system_health()
    print(f"System uptime: {health['uptime_formatted']}")
    print(f"Total operations: {health['total_operations']}")
    print(f"Cache hit rate: {health['cache_performance']['hit_rate_percent']}%")
    
    # Performance monitoring demo
    @performance_monitor("demo_calculation")
    def demo_calculation():
        time.sleep(0.1)  # Simulate calculation time
        return {'result': 'success'}
    
    print("\n⚡ Performance Monitoring:")
    result = demo_calculation()
    print(f"Calculation result: {result}")
    
    print("\n✅ Production enhancements active and functioning!")


if __name__ == "__main__":
    main()