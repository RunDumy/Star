#!/usr/bin/env python3
"""
Simple script to verify Supabase database tables exist using REST API
"""

import os
import sys

import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
    sys.exit(1)

def verify_tables():
    """Verify tables exist using Supabase REST API"""

    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
    }

    # List of expected tables
    expected_tables = [
        'users',
        'profiles',
        'posts',
        'follows',
        'likes',
        'comments',
        'notifications',
        'star_points',
        'star_point_transactions',
        'chat_messages',
        'zodiac_chat_messages',
        'groups',
        'group_members',
        'live_stream',
        'post_tags',
        'user_interactions',
        'prompts',
        'prompt_responses',
        'user_actions'
    ]

    print("🔍 Verifying Supabase database tables...")
    print(f"📍 Connected to: {SUPABASE_URL}")

    existing_tables = []
    missing_tables = []

    for table in expected_tables:
        try:
            # Try to query the table (limit 1 to minimize data transfer)
            url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1"
            response = requests.get(url, headers=headers, timeout=10)

            if response.status_code == 200:
                existing_tables.append(table)
                print(f"✅ Table '{table}' exists")
            elif response.status_code == 404:
                missing_tables.append(table)
                print(f"❌ Table '{table}' not found")
            else:
                missing_tables.append(table)
                print(f"❌ Table '{table}' error: {response.status_code}")

        except Exception as e:
            missing_tables.append(table)
            print(f"❌ Table '{table}' error: {str(e)}")

    print(f"\n📊 Verification Results:")
    print(f"✅ Existing tables: {len(existing_tables)}")
    print(f"❌ Missing tables: {len(missing_tables)}")

    if missing_tables:
        print(f"\n⚠️  Missing tables: {', '.join(missing_tables)}")
        print("\n📋 To fix this:")
        print("1. Go to https://supabase.com/dashboard")
        print("2. Open your project")
        print("3. Go to SQL Editor")
        print("4. Copy and paste the contents of supabase_schema.sql")
        print("5. Click 'Run' to execute the schema")
        return False
    else:
        print("\n🎉 All tables verified successfully!")
        print("\n✅ Database schema is ready for STAR Platform")
        return True

if __name__ == "__main__":
    success = verify_tables()
    sys.exit(0 if success else 1)