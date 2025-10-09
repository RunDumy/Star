import os
from azure.cosmos import CosmosClient
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_azure_config():
    """Get Azure configuration for Cosmos DB and other services"""
    return {
        'cosmos_endpoint': os.environ.get('AZURE_COSMOS_URL'),
        'cosmos_key': os.environ.get('AZURE_COSMOS_KEY'),
        'cosmos_database': os.environ.get('AZURE_COSMOS_DATABASE', 'star-db'),
        'redis_host': os.environ.get('AZURE_REDIS_HOST'),
        'redis_port': int(os.environ.get('AZURE_REDIS_PORT', 6380)),
        'redis_password': os.environ.get('AZURE_REDIS_PASSWORD'),
        'redis_ssl': os.environ.get('AZURE_REDIS_SSL', 'True').lower() == 'true',
        'storage_account': os.environ.get('AZURE_STORAGE_ACCOUNT'),
        'storage_key': os.environ.get('AZURE_STORAGE_KEY'),
        'app_insights_connection': os.environ.get('APPLICATIONINSIGHTS_CONNECTION_STRING'),
        'webpubsub_connection': os.environ.get('AZURE_WEBPUBSUB_CONNECTION_STRING'),
        'jwt_secret': os.environ.get('JWT_SECRET_KEY'),
        'subscription_id': os.environ.get('AZURE_SUBSCRIPTION_ID'),
        'resource_group': os.environ.get('AZURE_RESOURCE_GROUP', 'star-rg-20251009140454'),
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