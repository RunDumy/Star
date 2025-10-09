import os
from azure.cosmos import CosmosClient
from azure.identity import DefaultAzureCredential

def get_azure_config():
    """Get Azure configuration for Cosmos DB and other services"""
    return {
        'cosmos_endpoint': os.environ.get('COSMOS_ENDPOINT'),
        'cosmos_key': os.environ.get('COSMOS_KEY'),
        'redis_url': os.environ.get('REDIS_URL'),
        'jwt_secret': os.environ.get('JWT_SECRET_KEY'),
        'subscription_id': os.environ.get('AZURE_SUBSCRIPTION_ID'),
        'resource_group': os.environ.get('AZURE_RESOURCE_GROUP', 'star-resources'),
        'app_service_name': os.environ.get('AZURE_APP_SERVICE_NAME', 'star-app-backend')
    }

def get_cosmos_client():
    """Get configured Cosmos DB client"""
    config = get_azure_config()
    if config['cosmos_endpoint'] and config['cosmos_key']:
        return CosmosClient(config['cosmos_endpoint'], config['cosmos_key'])
    return None

def get_azure_credential():
    """Get Azure credential for authentication"""
    return DefaultAzureCredential()