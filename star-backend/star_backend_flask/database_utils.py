# -*- coding: utf-8 -*-
"""
Database utilities for STAR Platform
Shared database functions to avoid circular imports
"""
import logging
from datetime import datetime, timezone

from .cosmos_db import get_cosmos_helper

logger = logging.getLogger(__name__)

def check_username_exists(username):
    """Check if username exists in the database"""
    try:
        helper = get_cosmos_helper()
        users_table = helper.table('users')
        # Use Supabase query
        result = users_table.select('*').eq('username', username).execute()
        return len(result.data) > 0
    except Exception as e:
        logger.error(f"Error checking username exists: {e}")
        return False

def create_user(user_data):
    """Create a new user in the database"""
    try:
        helper = get_cosmos_helper()
        users_table = helper.table('users')
        
        # Add metadata
        user_data['created_at'] = datetime.now(timezone.utc).isoformat()
        user_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        user_data['is_online'] = True
        
        result = users_table.insert(user_data).execute()
        logger.info(f"Created user: {user_data.get('username')}")
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise

def get_user_by_username(username):
    """Get user by username"""
    try:
        helper = get_cosmos_helper()
        users_table = helper.table('users')
        result = users_table.select('*').eq('username', username).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"Error getting user by username: {e}")
        return None

def update_user_online_status(username, is_online=True):
    """Update user online status"""
    try:
        helper = get_cosmos_helper()
        users_table = helper.table('users')
        
        # Get user first
        user = get_user_by_username(username)
        if not user:
            return False
            
        # Update online status
        update_data = {
            'is_online': is_online,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        if is_online:
            update_data['last_seen'] = datetime.now(timezone.utc).isoformat()
            
        users_table.update(update_data).eq('username', username).execute()
        logger.info(f"Updated online status for {username}: {is_online}")
        return True
    except Exception as e:
        logger.error(f"Error updating user online status: {e}")
        return False

def get_users_container():
    """Get users container - helper function (returns Supabase table)"""
    try:
        helper = get_cosmos_helper()
        return helper.table('users')
    except Exception as e:
        logger.error(f"Error getting users container: {e}")
        return None