#!/usr/bin/env python3
"""
Supabase to Azure Cosmos DB Migration Script
Migrates data from Supabase PostgreSQL to Azure Cosmos DB
"""

import os
import json
from datetime import datetime
from supabase import create_client, Client
from azure.cosmos import CosmosClient, exceptions
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Cosmos DB configuration
COSMOS_ENDPOINT = os.getenv('COSMOS_ENDPOINT')
COSMOS_KEY = os.getenv('COSMOS_KEY')
DATABASE_NAME = 'StarDatabase'

def init_clients():
    """Initialize Supabase and Cosmos DB clients"""
    # Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase client initialized")

    # Cosmos DB client
    cosmos_client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
    print("✅ Cosmos DB client initialized")

    return supabase, cosmos_client

def create_cosmos_database(cosmos_client):
    """Create Cosmos DB database if it doesn't exist"""
    try:
        database = cosmos_client.create_database_if_not_exists(id=DATABASE_NAME)
        print(f"✅ Database '{DATABASE_NAME}' ready")
        return database
    except exceptions.CosmosResourceExistsError:
        print(f"✅ Database '{DATABASE_NAME}' already exists")
        return cosmos_client.get_database_client(DATABASE_NAME)

def migrate_table(supabase, cosmos_client, table_name, container_name, partition_key='/id'):
    """Migrate a single table from Supabase to Cosmos DB"""

    # Get Cosmos DB database and container
    database = cosmos_client.get_database_client(DATABASE_NAME)
    container = database.create_container_if_not_exists(
        id=container_name,
        partition_key={'paths': [partition_key], 'kind': 'Hash'}
    )

    # Fetch data from Supabase
    print(f"📊 Fetching data from Supabase table '{table_name}'...")
    response = supabase.table(table_name).select('*').execute()
    records = response.data

    print(f"📝 Migrating {len(records)} records to Cosmos DB container '{container_name}'...")

    # Insert records into Cosmos DB
    for record in records:
        try:
            # Add metadata
            record['_migrated_at'] = datetime.utcnow().isoformat()
            record['_source'] = 'supabase'
            record['_table'] = table_name

            container.upsert_item(record)
        except Exception as e:
            print(f"❌ Error migrating record {record.get('id', 'unknown')}: {e}")

    print(f"✅ Migration completed for table '{table_name}'")

def main():
    """Main migration function"""
    print("🚀 Starting Supabase to Cosmos DB migration...")

    # Validate environment variables
    required_vars = ['SUPABASE_URL', 'SUPABASE_KEY', 'COSMOS_ENDPOINT', 'COSMOS_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        return

    try:
        # Initialize clients
        supabase, cosmos_client = init_clients()

        # Create database
        database = create_cosmos_database(cosmos_client)

        # Define table to container mappings
        migrations = [
            ('user', 'Users', '/id'),
            ('post', 'Posts', '/user_id'),
            ('follow', 'Follows', '/follower_id'),
            ('comments', 'Comments', '/post_id'),
            ('user_posts', 'UserPosts', '/user_id'),
            ('user_interactions', 'UserInteractions', '/user_id'),
        ]

        # Perform migrations
        for table_name, container_name, partition_key in migrations:
            try:
                migrate_table(supabase, cosmos_client, table_name, container_name, partition_key)
            except Exception as e:
                print(f"❌ Failed to migrate table '{table_name}': {e}")

        print("🎉 Migration completed successfully!")

    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == '__main__':
    main()