#!/usr/bin/env python3
"""Test script to verify STAR platform backend functionality"""

import logging
import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

print("🌟 STAR Platform Backend Test Script")
print("=" * 50)

# Test 1: Environment Variables
print("\n1. Environment Variables Check:")
env_vars = [
    'COSMOS_DB_CONNECTION_STRING',
    'SECRET_KEY',
    'NEXT_PUBLIC_API_URL'
]

for var in env_vars:
    value = os.getenv(var)
    if value:
        # Mask sensitive values
        display_value = value[:10] + "..." if len(value) > 10 else value
        if 'SECRET' in var or 'CONNECTION' in var:
            display_value = "***CONFIGURED***"
        print(f"  ✅ {var}: {display_value}")
    else:
        print(f"  ❌ {var}: Not set")

# Test 2: Import Core Modules
print("\n2. Core Module Import Test:")
try:
    import cosmos_db
    print("  ✅ cosmos_db module imported successfully")
    
    # Test CosmosDBHelper initialization
    try:
        helper = cosmos_db.CosmosDBHelper()
        print("  ✅ CosmosDBHelper initialized successfully")
        
        # Test container initialization
        expected_containers = [
            'users', 'posts', 'chats', 'follows', 'likes', 'comments',
            'profiles', 'notifications', 'streams', 'zodiac_dna',
            'analytics_events', 'user_insights', 'rewards', 'leaderboard', 'store'
        ]
        
        print(f"  ✅ Expected containers: {len(expected_containers)}")
        print(f"  ✅ Containers initialized: {len(helper.containers)}")
        
    except Exception as e:
        print(f"  ❌ CosmosDBHelper initialization failed: {e}")
        
except ImportError as e:
    print(f"  ❌ cosmos_db import failed: {e}")

# Test 3: Flask App Import
print("\n3. Flask App Import Test:")
try:
    import app
    print("  ✅ Flask app imported successfully")
    print(f"  ✅ App name: {app.app.name}")
    
    # Test app configuration
    print(f"  ✅ Debug mode: {app.app.debug}")
    print(f"  ✅ Environment: {app.app.config.get('ENV', 'production')}")
    
except ImportError as e:
    print(f"  ❌ Flask app import failed: {e}")

# Test 4: API Endpoints Test
print("\n4. API Endpoints Test:")
try:
    import api
    print("  ✅ API module imported successfully")
    
    # Get registered routes
    with app.app.app_context():
        routes = []
        for rule in app.app.url_map.iter_rules():
            if '/api/v1/' in rule.rule:
                routes.append(rule.rule)
        
        print(f"  ✅ API v1 routes found: {len(routes)}")
        for route in routes[:5]:  # Show first 5 routes
            print(f"    - {route}")
        if len(routes) > 5:
            print(f"    ... and {len(routes) - 5} more routes")
            
except ImportError as e:
    print(f"  ❌ API module import failed: {e}")

print("\n" + "=" * 50)
print("🚀 Test Complete! Check results above.")