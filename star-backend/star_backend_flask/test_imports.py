#!/usr/bin/env python3
"""Test script to verify imports work correctly."""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Test the import that was failing
    import api as api_module
    print("✓ Successfully imported api module")
    print(f"✓ api_bp found: {hasattr(api_module, 'api_bp')}")
    print(f"✓ init_api_blueprint found: {hasattr(api_module, 'init_api_blueprint')}")

    # Test analytics import
    import analytics_api
    print("✓ Successfully imported analytics_api module")
    print(f"✓ analytics_bp found: {hasattr(analytics_api, 'analytics_bp')}")
    print(f"✓ init_analytics_blueprint found: {hasattr(analytics_api, 'init_analytics_blueprint')}")

    print("\n🎉 All imports successful! Backend should work correctly.")

except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)