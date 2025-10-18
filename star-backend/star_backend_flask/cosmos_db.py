import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from supabase import Client, create_client


# Mock Supabase client for development/testing
class MockSupabaseClient:
    """Mock Supabase client for development when real Supabase is not available"""

    def table(self, name: str):
        return MockTable(name)

class MockTable:
    """Mock table for development"""

    def __init__(self, name: str):
        self.name = name

    def select(self, *args, **kwargs):
        return MockQuery(self.name, "select")

    def insert(self, *args, **kwargs):
        return MockQuery(self.name, "insert")

    def update(self, *args, **kwargs):
        return MockQuery(self.name, "update")

    def delete(self, *args, **kwargs):
        return MockQuery(self.name, "delete")

    def upsert(self, *args, **kwargs):
        return MockQuery(self.name, "upsert")

class MockQuery:
    """Mock query for development"""

    def __init__(self, table_name: str, operation: str):
        self.table_name = table_name
        self.operation = operation

    def eq(self, *args, **kwargs):
        return self

    def neq(self, *args, **kwargs):
        return self

    def gt(self, *args, **kwargs):
        return self

    def gte(self, *args, **kwargs):
        return self

    def lt(self, *args, **kwargs):
        return self

    def lte(self, *args, **kwargs):
        return self

    def like(self, *args, **kwargs):
        return self

    def ilike(self, *args, **kwargs):
        return self

    def is_(self, *args, **kwargs):
        return self

    def in_(self, *args, **kwargs):
        return self

    def contains(self, *args, **kwargs):
        return self

    def contained_by(self, *args, **kwargs):
        return self

    def range(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def single(self, *args, **kwargs):
        return self

    def execute(self):
        # Return mock data based on operation
        if self.operation == "select":
            return {"data": [], "error": None}
        elif self.operation == "insert":
            return {"data": [{"id": str(uuid.uuid4())}], "error": None}
        elif self.operation == "update":
            return {"data": [], "error": None}
        elif self.operation == "delete":
            return {"data": [], "error": None}
        elif self.operation == "upsert":
            return {"data": [{"id": str(uuid.uuid4())}], "error": None}
        return {"data": [], "error": None}

# Constants
BLOB_STORAGE_NOT_INITIALIZED = "Blob storage not initialized"

# Query parameter constants (keeping for compatibility)
PARAM_USER_ID = "@user_id"
PARAM_USERNAME = "@username"
PARAM_ID = "@id"
PARAM_POST_ID = "@post_id"
PARAM_OFFSET = "@offset"
PARAM_LIMIT = "@limit"
PARAM_MENTOR_NAME = "@mentor_name"
PARAM_STATUS = "@status"
PARAM_QUEST_PROGRESS_ID = "@quest_progress_id"
PARAM_INTERACTION_ID = "@interaction_id"
PARAM_START_DATE = "@start_date"
PARAM_END_DATE = "@end_date"
PARAM_DATA_TYPE = "@data_type"
PARAM_TODAY = "@today"

class SupabaseDBHelper:
    """Helper class for Supabase database operations - replaces CosmosDBHelper"""

    def __init__(self):
        use_mock = os.getenv('USE_MOCK_SUPABASE', 'false').lower() == 'true'

        if use_mock:
            # Create a mock Supabase client for development/testing
            self.supabase = MockSupabaseClient()
            logging.info("Using mock Supabase client for development")
        else:
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_ANON_KEY')

            if not supabase_url or not supabase_key:
                raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set")

            try:
                self.supabase: Client = create_client(supabase_url, supabase_key)
                logging.info("Successfully connected to Supabase")
            except Exception as e:
                logging.error(f"Failed to connect to Supabase: {e}")
                # Fallback to mock client if connection fails
                self.supabase = MockSupabaseClient()
                logging.warning("Falling back to mock Supabase client")

    def _get_container(self, table_name: str):
        """Get table reference (for compatibility with Cosmos DB interface)"""
        return self.supabase.table(table_name)

    def get_container(self, table_name: str):
        """Get table reference (for compatibility)"""
        return self.supabase.table(table_name)

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user"""
        try:
            user_data['id'] = str(uuid.uuid4())
            user_data['created_at'] = datetime.now(timezone.utc).isoformat()
            user_data['updated_at'] = user_data['created_at']

            response = self.supabase.table('users').insert(user_data).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logging.error(f"Error creating user: {e}")
            raise

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        try:
            response = self.supabase.table('users').select('*').eq('username', username).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logging.error(f"Error getting user by username: {e}")
            return None

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user data"""
        try:
            updates['updated_at'] = datetime.now(timezone.utc).isoformat()
            response = self.supabase.table('users').update(updates).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logging.error(f"Error updating user: {e}")
            return None

    def create_post(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new post"""
        try:
            post_data['id'] = str(uuid.uuid4())
            post_data['created_at'] = datetime.now(timezone.utc).isoformat()
            post_data['updated_at'] = post_data['created_at']

            response = self.supabase.table('posts').insert(post_data).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logging.error(f"Error creating post: {e}")
            raise

    def get_posts(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get posts with pagination"""
        try:
            response = self.supabase.table('posts').select('*').order('created_at', desc=True).range(offset, offset + limit - 1).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting posts: {e}")
            return []

    def get_user_posts(self, username: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get posts by username"""
        try:
            response = self.supabase.table('posts').select('*').eq('username', username).order('created_at', desc=True).limit(limit).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting user posts: {e}")
            return []

    def get_posts_by_user_id(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get posts by user ID"""
        try:
            response = self.supabase.table('posts').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting posts by user ID: {e}")
            return []

    def get_post_by_id(self, post_id: str) -> Optional[Dict[str, Any]]:
        """Get post by ID"""
        try:
            response = self.supabase.table('posts').select('*').eq('id', post_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logging.error(f"Error getting post by ID: {e}")
            return None

    def update_post(self, post_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update post"""
        try:
            updates['updated_at'] = datetime.now(timezone.utc).isoformat()
            response = self.supabase.table('posts').update(updates).eq('id', post_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logging.error(f"Error updating post: {e}")
            return None

    def create_follow(self, follow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a follow relationship"""
        try:
            follow_data['id'] = str(uuid.uuid4())
            follow_data['created_at'] = datetime.now(timezone.utc).isoformat()

            response = self.supabase.table('follows').insert(follow_data).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logging.error(f"Error creating follow: {e}")
            raise

    def check_follow_exists(self, follower_username: str, followed_username: str) -> bool:
        """Check if follow relationship exists"""
        try:
            response = self.supabase.table('follows').select('*').eq('follower_username', follower_username).eq('followed_username', followed_username).execute()
            return len(response.data) > 0
        except Exception as e:
            logging.error(f"Error checking follow exists: {e}")
            return False

    def get_followers(self, user_id: str) -> List[Dict[str, Any]]:
        """Get followers for a user"""
        try:
            response = self.supabase.table('follows').select('*').eq('followed_id', user_id).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting followers: {e}")
            return []

    def get_following(self, user_id: str) -> List[Dict[str, Any]]:
        """Get users that a user is following"""
        try:
            response = self.supabase.table('follows').select('*').eq('follower_id', user_id).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting following: {e}")
            return []

    def update_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user profile"""
        try:
            profile_data['updated_at'] = datetime.now(timezone.utc).isoformat()
            response = self.supabase.table('profiles').update(profile_data).eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logging.error(f"Error updating profile: {e}")
            return None

    def get_profile_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get profile by user ID"""
        try:
            response = self.supabase.table('profiles').select('*').eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logging.error(f"Error getting profile: {e}")
            return None

    def create_like(self, like_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a like"""
        try:
            like_data['id'] = str(uuid.uuid4())
            like_data['created_at'] = datetime.now(timezone.utc).isoformat()

            response = self.supabase.table('likes').insert(like_data).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logging.error(f"Error creating like: {e}")
            raise

    def delete_like(self, post_id: str, user_id: str) -> bool:
        """Delete a like"""
        try:
            response = self.supabase.table('likes').delete().eq('post_id', post_id).eq('user_id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logging.error(f"Error deleting like: {e}")
            return False

    def check_like_exists(self, post_id: str, user_id: str) -> bool:
        """Check if like exists"""
        try:
            response = self.supabase.table('likes').select('*').eq('post_id', post_id).eq('user_id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logging.error(f"Error checking like exists: {e}")
            return False

    def get_likes_count(self, post_id: str) -> int:
        """Get likes count for a post"""
        try:
            response = self.supabase.table('likes').select('*', count='exact').eq('post_id', post_id).execute()
            return response.count or 0
        except Exception as e:
            logging.error(f"Error getting likes count: {e}")
            return 0

    def create_comment(self, comment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a comment"""
        try:
            comment_data['id'] = str(uuid.uuid4())
            comment_data['created_at'] = datetime.now(timezone.utc).isoformat()

            response = self.supabase.table('comments').insert(comment_data).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logging.error(f"Error creating comment: {e}")
            raise

    def get_comments_for_post(self, post_id: str) -> List[Dict[str, Any]]:
        """Get comments for a post"""
        try:
            response = self.supabase.table('comments').select('*').eq('post_id', post_id).order('created_at', desc=True).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting comments: {e}")
            return []

    def create_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a notification"""
        try:
            notification_data['id'] = str(uuid.uuid4())
            notification_data['created_at'] = datetime.now(timezone.utc).isoformat()

            response = self.supabase.table('notifications').insert(notification_data).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logging.error(f"Error creating notification: {e}")
            raise

    def get_notifications(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get notifications for a user"""
        try:
            response = self.supabase.table('notifications').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting notifications: {e}")
            return []

    # Placeholder methods for compatibility - implement as needed
    def create_spark(self, spark_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a spark (placeholder)"""
        logging.warning("create_spark not implemented for Supabase")
        return spark_data

    def get_sparks_by_post(self, _post_id: str) -> List[Dict[str, Any]]:
        """Get sparks by post (placeholder)"""
        logging.warning("get_sparks_by_post not implemented for Supabase")
        return []

    def check_spark_exists(self, _post_id: str, _user_id: str) -> bool:
        """Check spark exists (placeholder)"""
        logging.warning("check_spark_exists not implemented for Supabase")
        return False

    def get_sparks_count(self, _post_id: str) -> int:
        """Get sparks count (placeholder)"""
        logging.warning("get_sparks_count not implemented for Supabase")
        return 0

    def get_comments(self, post_id: str, page: int = 1, per_page: int = 10) -> List[Dict[str, Any]]:
        """Get comments with pagination"""
        try:
            offset = (page - 1) * per_page
            response = self.supabase.table('comments').select('*').eq('post_id', post_id).order('created_at', desc=True).range(offset, offset + per_page - 1).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting comments: {e}")
            return []

    def get_comments_by_post(self, post_id: str) -> List[Dict[str, Any]]:
        """Alias for get_comments_for_post"""
        return self.get_comments_for_post(post_id)

    def get_notification_by_id(self, notification_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get notification by ID"""
        try:
            response = self.supabase.table('notifications').select('*').eq('id', notification_id).eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logging.error(f"Error getting notification: {e}")
            return None

    def update_notification(self, notification_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update notification"""
        try:
            response = self.supabase.table('notifications').update(updates).eq('id', notification_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logging.error(f"Error updating notification: {e}")
            return None

    # Additional placeholder methods for compatibility
    def create_stream_chat_message(self, chat_data: Dict[str, Any]) -> Dict[str, Any]:
        logging.warning("create_stream_chat_message not implemented for Supabase")
        return chat_data

    def get_stream_chat_messages(self, _stream_id: str, _limit: int = 50) -> List[Dict[str, Any]]:
        logging.warning("get_stream_chat_messages not implemented for Supabase")
        return []

    def create_live_stream(self, stream_data: Dict[str, Any]) -> Dict[str, Any]:
        logging.warning("create_live_stream not implemented for Supabase")
        return stream_data

    def get_active_live_stream_by_id(self, _stream_id: str) -> Optional[Dict[str, Any]]:
        logging.warning("get_active_live_stream_by_id not implemented for Supabase")
        return None

    def get_active_live_streams(self) -> List[Dict[str, Any]]:
        logging.warning("get_active_live_streams not implemented for Supabase")
        return []

    def end_live_stream(self, _stream_id: str, _user_id: str) -> Optional[Dict[str, Any]]:
        logging.warning("end_live_stream not implemented for Supabase")
        return None

    def upsert_zodiac_dna(self, dna_data: Dict[str, Any]) -> Dict[str, Any]:
        logging.warning("upsert_zodiac_dna not implemented for Supabase")
        return dna_data

    def get_zodiac_dna_by_user_and_trait(self, _user_id: str, _trait_name: str) -> Optional[Dict[str, Any]]:
        logging.warning("get_zodiac_dna_by_user_and_trait not implemented for Supabase")
        return None

    def get_zodiac_dna_by_user(self, _user_id: str) -> List[Dict[str, Any]]:
        logging.warning("get_zodiac_dna_by_user not implemented for Supabase")
        return []

    def create_user_interaction(self, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        logging.warning("create_user_interaction not implemented for Supabase")
        return interaction_data

    def get_user_interactions(self, _user_id: str, _interaction_type: str = None, _limit: int = 50) -> List[Dict[str, Any]]:
        logging.warning("get_user_interactions not implemented for Supabase")
        return []

    def create_post_tag(self, tag_data: Dict[str, Any]) -> Dict[str, Any]:
        logging.warning("create_post_tag not implemented for Supabase")
        return tag_data

    def get_followers_count(self, user_id: str) -> int:
        """Get followers count"""
        try:
            response = self.supabase.table('follows').select('*', count='exact').eq('followed_id', user_id).execute()
            return response.count or 0
        except Exception as e:
            logging.error(f"Error getting followers count: {e}")
            return 0

    def upload_blob(self, _blob_name: str, _data: bytes, _content_type: str = 'application/octet-stream') -> Optional[str]:
        """Upload to Supabase Storage (placeholder - implement with Supabase Storage)"""
        logging.warning("upload_blob not implemented for Supabase Storage")
        return None

    def get_blob_url(self, _blob_name: str) -> Optional[str]:
        """Get blob URL from Supabase Storage (placeholder)"""
        logging.warning("get_blob_url not implemented for Supabase Storage")
        return None

    def delete_blob(self, _blob_name: str) -> bool:
        """Delete blob from Supabase Storage (placeholder)"""
        logging.warning("delete_blob not implemented for Supabase Storage")
        return False

    # Additional placeholder methods
    def upsert_score(self, user_id, score, stage, game_type="zodiac_arena"):
        logging.warning("upsert_score not implemented for Supabase")

    def upsert_reward(self, user_id, item_id, reward_type, stage):
        logging.warning("upsert_reward not implemented for Supabase")

    def get_user_rewards(self, user_id):
        logging.warning("get_user_rewards not implemented for Supabase")
        return []

    def get_leaderboard(self, game_type="zodiac_arena", limit=100):
        logging.warning("get_leaderboard not implemented for Supabase")
        return []

    def store_analytics_event(self, event_data):
        logging.warning("store_analytics_event not implemented for Supabase")

    def store_user_insight(self, insight_data):
        logging.warning("store_user_insight not implemented for Supabase")

    def upload_media_to_blob(self, file, media_type='media'):
        logging.warning("upload_media_to_blob not implemented for Supabase")
        return None

    def create_mentor_interaction(self, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        logging.warning("create_mentor_interaction not implemented for Supabase")
        return interaction_data

    def get_mentor_interactions(self, user_id: str, mentor_name: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        logging.warning("get_mentor_interactions not implemented for Supabase")
        return []

    def update_mentor_interaction(self, interaction_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        logging.warning("update_mentor_interaction not implemented for Supabase")
        return None

    def create_quest_progress(self, quest_data: Dict[str, Any]) -> Dict[str, Any]:
        logging.warning("create_quest_progress not implemented for Supabase")
        return quest_data

    def get_user_quests(self, user_id: str, status: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        logging.warning("get_user_quests not implemented for Supabase")
        return []

    def update_quest_progress(self, quest_progress_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        logging.warning("update_quest_progress not implemented for Supabase")
        return None

    def get_quest_by_id(self, quest_progress_id: str) -> Optional[Dict[str, Any]]:
        logging.warning("get_quest_by_id not implemented for Supabase")
        return None

    def complete_quest(self, quest_progress_id: str, completion_data: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        logging.warning("complete_quest not implemented for Supabase")
        return None

    def store_lunar_data(self, lunar_data: Dict[str, Any]) -> Dict[str, Any]:
        logging.warning("store_lunar_data not implemented for Supabase")
        return lunar_data

    def get_lunar_data(self, start_date: str, end_date: str, data_type: Optional[str] = None) -> List[Dict[str, Any]]:
        logging.warning("get_lunar_data not implemented for Supabase")
        return []

    def get_current_moon_phase(self) -> Optional[Dict[str, Any]]:
        logging.warning("get_current_moon_phase not implemented for Supabase")
        return None

    def get_void_periods(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        logging.warning("get_void_periods not implemented for Supabase")
        return []

    def get_upcoming_eclipses(self, limit: int = 10) -> List[Dict[str, Any]]:
        logging.warning("get_upcoming_eclipses not implemented for Supabase")
        return []

    def get_user_cosmic_stats(self, user_id: str) -> Dict[str, Any]:
        logging.warning("get_user_cosmic_stats not implemented for Supabase")
        return {}


# For backward compatibility
CosmosDBHelper = SupabaseDBHelper

# Global helper instance
_cosmos_helper = None

def get_cosmos_helper() -> SupabaseDBHelper:
    """Get global SupabaseDBHelper instance (for backward compatibility)"""
    global _cosmos_helper
    if _cosmos_helper is None:
        _cosmos_helper = SupabaseDBHelper()
    return _cosmos_helper