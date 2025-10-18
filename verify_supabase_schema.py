#!/usr/bin/env python3
"""
Script to verify Supabase database schema for STAR Platform
"""

import os
import sys

from supabase import Client, create_client

# Load environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
    sys.exit(1)

def verify_supabase_schema():
    """Verify the Supabase database schema"""

    try:
        # Create Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

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

        print("🔍 Verifying Supabase database schema...")
        print(f"📍 Connected to: {SUPABASE_URL}")

        # Check if tables exist by trying to select from them
        existing_tables = []
        missing_tables = []

        for table in expected_tables:
            try:
                # Try to get table info (this will fail if table doesn't exist)
                supabase.table(table).select('*').limit(1).execute()
                existing_tables.append(table)
                print(f"✅ Table '{table}' exists")
            except Exception as e:
                missing_tables.append(table)
                print(f"❌ Table '{table}' missing or inaccessible")

        print(f"\n📊 Schema Verification Results:")
        print(f"✅ Existing tables: {len(existing_tables)}")
        print(f"❌ Missing tables: {len(missing_tables)}")

        if missing_tables:
            print(f"\n⚠️  Missing tables: {', '.join(missing_tables)}")
            print("Please run the supabase_schema.sql in your Supabase SQL Editor")
            return False
        else:
            print("\n🎉 All tables verified successfully!")
            return True

    except Exception as e:
        print(f"❌ Error verifying schema: {e}")
        return False

if __name__ == "__main__":
    success = verify_supabase_schema()
    sys.exit(0 if success else 1)