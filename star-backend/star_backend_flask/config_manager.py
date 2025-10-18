#!/usr/bin/env python3
"""
Configuration Integration for STAR Platform
Integrates Azure Key Vault with existing environment configuration
"""

import logging
import os
from typing import Any, Dict, Optional

from azure_keyvault_manager import get_key_vault_manager

logger = logging.getLogger(__name__)

class ConfigurationManager:
    """
    Manages configuration from multiple sources:
    1. Azure Key Vault (production)
    2. Environment variables (development)
    3. Default values (fallback)
    """
    
    def __init__(self):
        self.key_vault_manager = None
        self.config_cache = {}
        self._initialize_key_vault()
    
    def _initialize_key_vault(self):
        """Initialize Key Vault connection if available"""
        try:
            self.key_vault_manager = get_key_vault_manager()
            if self.key_vault_manager.client:
                logger.info("Key Vault configuration manager initialized")
            else:
                logger.info("Key Vault not available, using environment variables only")
        except Exception as e:
            logger.warning(f"Failed to initialize Key Vault: {e}")
            self.key_vault_manager = None
    
    def get_config(self, key: str, default: Optional[str] = None, required: bool = False) -> Optional[str]:
        """
        Get configuration value from multiple sources in order:
        1. Azure Key Vault
        2. Environment variables
        3. Default value
        """
        # Check cache first
        if key in self.config_cache:
            return self.config_cache[key]
        
        value = None
        
        # Try Key Vault first
        if self.key_vault_manager:
            try:
                value = self.key_vault_manager.get_secret(key)
                if value:
                    logger.debug(f"Retrieved {key} from Key Vault")
            except Exception as e:
                logger.warning(f"Failed to get {key} from Key Vault: {e}")
        
        # Fall back to environment variable
        if not value:
            value = os.getenv(key)
            if value:
                logger.debug(f"Retrieved {key} from environment")
        
        # Use default if still no value
        if not value and default:
            value = default
            logger.debug(f"Using default value for {key}")
        
        # Check if required
        if required and not value:
            logger.error(f"Required configuration {key} not found")
            raise ValueError(f"Required configuration {key} not found")
        
        # Cache the result
        if value:
            self.config_cache[key] = value
        
        return value
    
    def get_database_config(self) -> Dict[str, Any]:
        """Get database configuration"""
        return {
            'connection_string': self.get_config('COSMOS_DB_CONNECTION_STRING', required=True),
            'database_name': self.get_config('COSMOS_DB_DATABASE_NAME', 'star_platform'),
            'container_prefix': self.get_config('COSMOS_DB_CONTAINER_PREFIX', '')
        }
    
    def get_spotify_config(self) -> Dict[str, Any]:
        """Get Spotify API configuration"""
        return {
            'client_id': self.get_config('SPOTIFY_CLIENT_ID'),
            'client_secret': self.get_config('SPOTIFY_CLIENT_SECRET'),
            'redirect_uri': self.get_config('SPOTIFY_REDIRECT_URI', 'http://localhost:3000/callback')
        }
    
    def get_auth_config(self) -> Dict[str, Any]:
        """Get authentication configuration"""
        return {
            'jwt_secret': self.get_config('JWT_SECRET_KEY', required=True),
            'jwt_expiry': int(self.get_config('JWT_EXPIRY_HOURS', '24')),
            'bcrypt_rounds': int(self.get_config('BCRYPT_ROUNDS', '12'))
        }
    
    def get_agora_config(self) -> Dict[str, Any]:
        """Get Agora RTC configuration"""
        return {
            'app_id': self.get_config('AGORA_APP_ID'),
            'app_certificate': self.get_config('AGORA_APP_CERTIFICATE')
        }
    
    def get_azure_config(self) -> Dict[str, Any]:
        """Get Azure services configuration"""
        return {
            'storage_connection': self.get_config('AZURE_STORAGE_CONNECTION_STRING'),
            'application_insights_key': self.get_config('AZURE_APPLICATION_INSIGHTS_KEY'),
            'key_vault_url': self.get_config('AZURE_KEY_VAULT_URL')
        }
    
    def get_external_apis_config(self) -> Dict[str, Any]:
        """Get external API configuration"""
        return {
            'ipgeolocation_key': self.get_config('IPGEOLOCATION_API_KEY'),
            'openai_key': self.get_config('OPENAI_API_KEY'),
            'anthropic_key': self.get_config('ANTHROPIC_API_KEY')
        }
    
    def clear_cache(self):
        """Clear configuration cache"""
        self.config_cache.clear()
        logger.info("Configuration cache cleared")
    
    def validate_configuration(self) -> Dict[str, Any]:
        """Validate all configuration and return status"""
        validation = {
            'database': {},
            'auth': {},
            'spotify': {},
            'agora': {},
            'azure': {},
            'external_apis': {},
            'overall_status': 'unknown'
        }
        
        try:
            # Database validation
            db_config = self.get_database_config()
            validation['database'] = {
                'connection_string': bool(db_config['connection_string']),
                'database_name': bool(db_config['database_name'])
            }
            
            # Auth validation
            auth_config = self.get_auth_config()
            validation['auth'] = {
                'jwt_secret': bool(auth_config['jwt_secret']),
                'jwt_expiry': auth_config['jwt_expiry'] > 0
            }
            
            # Spotify validation
            spotify_config = self.get_spotify_config()
            validation['spotify'] = {
                'client_id': bool(spotify_config['client_id']),
                'client_secret': bool(spotify_config['client_secret'])
            }
            
            # Agora validation
            agora_config = self.get_agora_config()
            validation['agora'] = {
                'app_id': bool(agora_config['app_id']),
                'app_certificate': bool(agora_config['app_certificate'])
            }
            
            # Azure validation
            azure_config = self.get_azure_config()
            validation['azure'] = {
                'storage_connection': bool(azure_config['storage_connection']),
                'key_vault_url': bool(azure_config['key_vault_url'])
            }
            
            # External APIs validation
            external_config = self.get_external_apis_config()
            validation['external_apis'] = {
                'ipgeolocation_key': bool(external_config['ipgeolocation_key']),
                'openai_key': bool(external_config['openai_key'])
            }
            
            # Overall status
            critical_missing = (
                not validation['database']['connection_string'] or
                not validation['auth']['jwt_secret']
            )
            
            if critical_missing:
                validation['overall_status'] = 'critical_missing'
            elif not all([
                validation['spotify']['client_id'],
                validation['agora']['app_id']
            ]):
                validation['overall_status'] = 'features_limited'
            else:
                validation['overall_status'] = 'healthy'
                
        except Exception as e:
            logger.error(f"Configuration validation failed: {e}")
            validation['overall_status'] = 'error'
            validation['error'] = str(e)
        
        return validation

# Global configuration manager instance
_config_manager = None

def get_config_manager() -> ConfigurationManager:
    """Get the global configuration manager instance"""
    global _config_manager
    if _config_manager is None:
        _config_manager = ConfigurationManager()
    return _config_manager

def get_config(key: str, default: Optional[str] = None, required: bool = False) -> Optional[str]:
    """Convenience function to get configuration"""
    return get_config_manager().get_config(key, default, required)