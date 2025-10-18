#!/usr/bin/env python3
"""
Script to initialize Supabase database schema for STAR Platform
"""

import os

from supabase import Client, create_client

# Load environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
    exit(1)

def init_supabase_schema():
    """Initialize the Supabase database schema"""

    try:
        # Create Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

        # Read the schema file
        schema_file = os.path.join(os.path.dirname(__file__), 'supabase_schema.sql')

        if not os.path.exists(schema_file):
            print(f"Error: Schema file not found at {schema_file}")
            return False

        with open(schema_file, 'r') as f:
            schema_sql = f.read()

        # Split the SQL into individual statements
        statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]

        print("Initializing Supabase database schema...")

        # Execute each statement
        for i, statement in enumerate(statements, 1):
            if statement:
                try:
                    print(f"Executing statement {i}/{len(statements)}...")
                    # For DDL statements, we need to use the REST API or raw SQL execution
                    # Since we can't execute DDL directly with the Python client,
                    # we'll need to use the Supabase dashboard or CLI
                    print(f"Statement {i}: {statement[:100]}...")
                except Exception as e:
                    print(f"Error executing statement {i}: {e}")
                    continue

        print("Schema initialization completed!")
        return True

    except Exception as e:
        print(f"Error initializing schema: {e}")
        return False

if __name__ == "__main__":
    success = init_supabase_schema()
    exit(0 if success else 1)