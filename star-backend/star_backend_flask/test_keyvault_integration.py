#!/usr/bin/env python3
"""
Test Azure Key Vault Integration for STAR Platform
"""

import os
import sys

# Add the star-backend flask directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from azure_keyvault_manager import (get_key_vault_manager,
                                        validate_configuration)
    from config_manager import get_config_manager
    
    def test_key_vault_integration():
        """Test Key Vault integration"""
        print("🔐 Testing Azure Key Vault Integration...")
        print("=" * 50)
        
        # Test Key Vault manager
        print("\n1. Testing Key Vault Manager:")
        try:
            kv_manager = get_key_vault_manager()
            print(f"   ✓ Key Vault URL: {kv_manager.vault_url or 'Not configured'}")
            print(f"   ✓ Client available: {kv_manager.client is not None}")
            print(f"   ✓ Credential available: {kv_manager.credential is not None}")
            print(f"   ✓ Secret configs loaded: {len(kv_manager.secret_configs)}")
        except Exception as e:
            print(f"   ✗ Key Vault Manager error: {e}")
        
        # Test configuration manager
        print("\n2. Testing Configuration Manager:")
        try:
            config_manager = get_config_manager()
            
            # Test database config
            db_config = config_manager.get_database_config()
            print(f"   ✓ Database connection configured: {bool(db_config['connection_string'])}")
            
            # Test auth config
            auth_config = config_manager.get_auth_config()
            print(f"   ✓ JWT secret configured: {bool(auth_config['jwt_secret'])}")
            
            # Test Spotify config
            spotify_config = config_manager.get_spotify_config()
            print(f"   ✓ Spotify client ID configured: {bool(spotify_config['client_id'])}")
            print(f"   ✓ Spotify client secret configured: {bool(spotify_config['client_secret'])}")
            
        except Exception as e:
            print(f"   ✗ Configuration Manager error: {e}")
        
        # Test configuration validation
        print("\n3. Testing Configuration Validation:")
        try:
            validation = validate_configuration()
            print(f"   ✓ Key Vault connectivity: {validation.get('key_vault_available', False)}")
            print(f"   ✓ Authentication chain: {validation.get('authentication_method', 'unknown')}")
            print(f"   ✓ Secret count: {validation.get('secrets_configured', 0)}")
        except Exception as e:
            print(f"   ✗ Validation error: {e}")
        
        # Test full validation
        print("\n4. Testing Full Configuration Validation:")
        try:
            config_manager = get_config_manager()
            full_validation = config_manager.validate_configuration()
            print(f"   ✓ Overall status: {full_validation['overall_status']}")
            print(f"   ✓ Database ready: {full_validation['database']['connection_string']}")
            print(f"   ✓ Auth ready: {full_validation['auth']['jwt_secret']}")
            print(f"   ✓ Spotify ready: {full_validation['spotify']['client_id']}")
        except Exception as e:
            print(f"   ✗ Full validation error: {e}")
        
        print("\n" + "=" * 50)
        print("🎯 Key Vault integration test completed!")
        
        # Test some configuration retrieval
        print("\n5. Testing Configuration Retrieval:")
        try:
            config_manager = get_config_manager()
            
            # Test getting a configuration that should exist
            cosmos_connection = config_manager.get_config('COSMOS_DB_CONNECTION_STRING')
            print(f"   ✓ Cosmos DB connection: {'Configured' if cosmos_connection else 'Not configured'}")
            
            # Test getting a configuration with default
            test_config = config_manager.get_config('TEST_CONFIG', default='test_default')
            print(f"   ✓ Default value test: {test_config}")
            
        except Exception as e:
            print(f"   ✗ Configuration retrieval error: {e}")

    if __name__ == "__main__":
        test_key_vault_integration()
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the star-backend/star_backend_flask directory")