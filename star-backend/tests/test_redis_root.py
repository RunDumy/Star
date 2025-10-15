import redis
import os

# Redis URL from the provided information
redis_url = "redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341"

try:
    print(f"Connecting to Redis using URL: {redis_url}")
    r = redis.Redis.from_url(redis_url, decode_responses=True)
    
    # Test setting a value
    print("Setting test value 'foo' to 'bar'")
    r.set('foo', 'bar')
    
    # Test retrieving the value
    value = r.get('foo')
    print(f"Retrieved value: {value}")
    
    if value == 'bar':
        print("✅ Redis connection test SUCCESSFUL")
    else:
        print("❌ Redis connection test FAILED: Unexpected value retrieved")
        
except Exception as e:
    print(f"❌ Redis connection test FAILED: {str(e)}")
    print("\nTrying with SSL...")
    try:
        # Try with SSL (rediss://)
        redis_url_ssl = redis_url.replace("redis://", "rediss://")
        print(f"Connecting to Redis using URL with SSL: {redis_url_ssl}")
        r = redis.Redis.from_url(redis_url_ssl, decode_responses=True, ssl_cert_reqs=None)
        
        # Test setting a value
        print("Setting test value 'foo' to 'bar'")
        r.set('foo', 'bar')
        
        # Test retrieving the value
        value = r.get('foo')
        print(f"Retrieved value: {value}")
        
        if value == 'bar':
            print("✅ Redis connection with SSL test SUCCESSFUL")
        else:
            print("❌ Redis connection with SSL test FAILED: Unexpected value retrieved")
    except Exception as e:
        print(f"❌ Redis connection with SSL test FAILED: {str(e)}")