import logging
import os
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from azure.cosmos import CosmosClient, exceptions

# Constants
BLOB_STORAGE_NOT_INITIALIZED = "Blob storage not initialized"

# Query parameter constants
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

try:
    from azure.storage.blob import (BlobClient, BlobServiceClient,
                                    ContainerClient)
    azure_storage_available = True
except ImportError:
    azure_storage_available = False
    BlobServiceClient = None
    BlobClient = None
    ContainerClient = None

# Mock container for local development without Cosmos DB
class MockContainer:
    """Mock container that returns empty results for local development"""
    
    def create_item(self, body):
        logging.info("Mock: Creating item in container")
        return body
    
    def upsert_item(self, body):
        logging.info("Mock: Upserting item in container")
        return body
    
    def query_items(self, query, parameters=None, enable_cross_partition_query=False):
        logging.info("Mock: Querying items")
        return []
    
    def get_item(self, item, partition_key):
        logging.info("Mock: Getting item")
        return {}

class CosmosDBHelper:
    """Helper class for Azure Cosmos DB operations"""

    def __init__(self):
        connection_string = os.getenv('COSMOS_DB_CONNECTION_STRING')
        if not connection_string:
            raise ValueError("COSMOS_DB_CONNECTION_STRING environment variable not set")

        # For local development without Cosmos DB emulator, use mock
        if os.getenv('USE_MOCK_COSMOS', 'false').lower() == 'true':
            logging.warning("Using mock Cosmos DB for local development")
            self.client = None
            self.database_name = os.getenv('COSMOS_DB_DATABASE_NAME', 'star-db')
            self.database = None
            self.containers = {}
            return

        # For local development, wait for Cosmos DB emulator to be ready
        max_retries = 10
        retry_delay = 5
        
        for attempt in range(max_retries):
            try:
                self.client = CosmosClient.from_connection_string(connection_string)
                self.database_name = os.getenv('COSMOS_DB_DATABASE_NAME', 'star-db')
                self.database = None
                self.containers = {}
                # Test the connection
                self.client.get_database_client(self.database_name)
                logging.info("Successfully connected to Cosmos DB")
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    logging.warning(f"Cosmos DB connection attempt {attempt + 1} failed: {e}. Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                else:
                    logging.error(f"Failed to connect to Cosmos DB after {max_retries} attempts: {e}")
                    raise

        # Initialize Azure Blob Storage
        self.blob_service_client = None
        self.blob_container_name = 'posts'  # Default container for media

        if self.client:
            try:
                self.database = self.client.get_database_client(self.database_name)
                # Initialize container clients
                self._init_containers()
                # Initialize blob storage
                self._init_blob_storage()
            except exceptions.CosmosResourceNotFoundError:
                logging.warning(f"Database {self.database_name} not found. Please ensure it exists.")
            except Exception as e:
                logging.error(f"Failed to initialize Cosmos DB: {e}")

    def _init_containers(self):
        """Initialize container clients"""
        container_names = ['users', 'posts', 'chats', 'follows', 'likes', 'comments', 'profiles', 'notifications', 'stream_chat', 'streams', 'zodiac_dna', 'user_interactions', 'analytics_events', 'user_insights', 'rewards', 'leaderboard', 'store', 'mentor_interactions', 'quest_progress', 'lunar_cycles']
        for container_name in container_names:
            try:
                self.containers[container_name] = self.database.get_container_client(container_name)
            except exceptions.CosmosResourceNotFoundError:
                logging.warning(f"Container {container_name} not found. It will be created when needed.")
                self.containers[container_name] = None

    def _init_blob_storage(self):
        """Initialize Azure Blob Storage client"""
        try:
            blob_connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
            if blob_connection_string:
                self.blob_service_client = BlobServiceClient.from_connection_string(blob_connection_string)
                # Create container if it doesn't exist
                try:
                    self.blob_service_client.create_container(self.blob_container_name)
                    logging.info(f"Created blob container: {self.blob_container_name}")
                except Exception as e:
                    if "ContainerAlreadyExists" not in str(e):
                        logging.warning(f"Could not create blob container: {e}")
            else:
                logging.warning("AZURE_STORAGE_CONNECTION_STRING not found. Blob storage disabled.")
        except Exception as e:
            logging.error(f"Failed to initialize blob storage: {e}")

    def _get_container(self, container_name: str):
        """Get container client, create if doesn't exist"""
        # For mock mode, return a mock container
        if self.client is None:
            return MockContainer()
        
        if self.containers.get(container_name) is None:
            try:
                self.containers[container_name] = self.database.get_container_client(container_name)
            except exceptions.CosmosResourceNotFoundError:
                logging.error(f"Container {container_name} does not exist")
                return None
        return self.containers[container_name]

    def get_container(self, container_name: str):
        """Public method to get container client - for external modules"""
        return self._get_container(container_name)

    # User operations
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user"""
        container = self._get_container('users')
        if container:
            try:
                return container.create_item(body=user_data)
            except exceptions.CosmosResourceExistsError:
                raise ValueError("User already exists")
        return {}

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        container = self._get_container('users')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.username = @username"
                parameters = [{"name": "@username", "value": username}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return items[0] if items else None
            except Exception as e:
                logging.error(f"Error getting user {username}: {e}")
        return None

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user data"""
        container = self._get_container('users')
        if container:
            try:
                # First get the current item
                query = "SELECT * FROM c WHERE c.id = @id"
                parameters = [{"name": "@id", "value": user_id}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                if items:
                    current_item = items[0]
                    current_item.update(updates)
                    return container.replace_item(item=current_item, body=current_item)
            except Exception as e:
                logging.error(f"Error updating user {user_id}: {e}")
        return None

    # Post operations
    def create_post(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new post"""
        container = self._get_container('posts')
        if container:
            try:
                return container.create_item(body=post_data)
            except Exception as e:
                logging.error(f"Error creating post: {e}")
        return {}

    def get_posts(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get posts with pagination"""
        container = self._get_container('posts')
        if container:
            try:
                query = "SELECT * FROM c ORDER BY c.created_at DESC OFFSET @offset LIMIT @limit"
                parameters = [
                    {"name": "@offset", "value": offset},
                    {"name": "@limit", "value": limit}
                ]
                return list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
            except Exception as e:
                logging.error(f"Error getting posts: {e}")
        return []

    def get_user_posts(self, username: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get posts by a specific user"""
        container = self._get_container('posts')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.username = @username ORDER BY c.created_at DESC"
                parameters = [{"name": "@username", "value": username}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return items[:limit]
            except Exception as e:
                logging.error(f"Error getting posts for user {username}: {e}")
        return []

    def get_posts_by_user_id(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get posts by user ID (for SQLAlchemy migration compatibility)"""
        container = self._get_container('posts')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.user_id = @user_id ORDER BY c.created_at DESC OFFSET 0 LIMIT @limit"
                parameters = [
                    {"name": "@user_id", "value": user_id},
                    {"name": "@limit", "value": limit}
                ]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return items
            except Exception as e:
                logging.error(f"Error getting posts for user {user_id}: {e}")
        return []

    def get_post_by_id(self, post_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific post by ID"""
        container = self._get_container('posts')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.id = @post_id"
                parameters = [{"name": "@post_id", "value": post_id}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return items[0] if items else None
            except Exception as e:
                logging.error(f"Error getting post {post_id}: {e}")
        return None

    def update_post(self, post_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a post"""
        container = self._get_container('posts')
        if container:
            try:
                # Get existing post
                existing_post = self.get_post_by_id(post_id)
                if not existing_post:
                    return None
                
                # Update fields
                existing_post.update(updates)
                
                # Save updated post
                return container.replace_item(item=post_id, body=existing_post)
            except Exception as e:
                logging.error(f"Error updating post {post_id}: {e}")
        return None

    # Follow operations
    def create_follow(self, follow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a follow relationship"""
        container = self._get_container('follows')
        if container:
            try:
                return container.create_item(body=follow_data)
            except exceptions.CosmosResourceExistsError:
                raise ValueError("Follow relationship already exists")
        return {}

    def check_follow_exists(self, follower_username: str, followed_username: str) -> bool:
        """Check if a follow relationship exists"""
        container = self._get_container('follows')
        if container:
            try:
                query = "SELECT VALUE COUNT(1) FROM c WHERE c.follower_username = @follower AND c.followed_username = @followed"
                parameters = [
                    {"name": "@follower", "value": follower_username},
                    {"name": "@followed", "value": followed_username}
                ]
                result = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return result[0] > 0 if result else False
            except Exception as e:
                logging.error(f"Error checking follow relationship: {e}")
        return False

    def get_followers(self, user_id: str) -> List[Dict[str, Any]]:
        """Get followers for a user"""
        container = self._get_container('follows')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.followed_id = @user_id"
                parameters = [{"name": "@user_id", "value": user_id}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return items
            except Exception as e:
                logging.error(f"Error getting followers for user {user_id}: {e}")
        return []

    def get_following(self, user_id: str) -> List[Dict[str, Any]]:
        """Get users that a user follows"""
        container = self._get_container('follows')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.follower_id = @user_id"
                parameters = [{"name": "@user_id", "value": user_id}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return items
            except Exception as e:
                logging.error(f"Error getting following for user {user_id}: {e}")
        return []

    # Profile operations
    def update_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user profile"""
        container = self._get_container('profiles')
        if container:
            try:
                # First get the current profile
                query = "SELECT * FROM c WHERE c.id = @id"
                parameters = [{"name": "@id", "value": user_id}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                if items:
                    current_item = items[0]
                    current_item.update(profile_data)
                    return container.replace_item(item=current_item, body=current_item)
                else:
                    # Create new profile if doesn't exist
                    profile_data['id'] = user_id
                    return container.create_item(body=profile_data)
            except Exception as e:
                logging.error(f"Error updating profile for user {user_id}: {e}")
        return None

    def get_profile_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get profile by user ID"""
        container = self._get_container('profiles')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.id = @id"
                parameters = [{"name": "@id", "value": user_id}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return items[0] if items else None
            except Exception as e:
                logging.error(f"Error getting profile for user {user_id}: {e}")
        return None

    # Like operations
    def create_like(self, like_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a like"""
        container = self._get_container('likes')
        if container:
            try:
                return container.create_item(body=like_data)
            except exceptions.CosmosResourceExistsError:
                raise ValueError("Like already exists")
        return {}

    def delete_like(self, post_id: str, user_id: str) -> bool:
        """Delete a like"""
        container = self._get_container('likes')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.post_id = @post_id AND c.user_id = @user_id"
                parameters = [
                    {"name": "@post_id", "value": post_id},
                    {"name": "@user_id", "value": user_id}
                ]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                if items:
                    container.delete_item(item=items[0], partition_key=items[0]['id'])
                    return True
            except Exception as e:
                logging.error(f"Error deleting like: {e}")
        return False

    def check_like_exists(self, post_id: str, user_id: str) -> bool:
        """Check if a like exists"""
        container = self._get_container('likes')
        if container:
            try:
                query = "SELECT VALUE COUNT(1) FROM c WHERE c.post_id = @post_id AND c.user_id = @user_id"
                parameters = [
                    {"name": "@post_id", "value": post_id},
                    {"name": "@user_id", "value": user_id}
                ]
                result = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return result[0] > 0 if result else False
            except Exception as e:
                logging.error(f"Error checking like: {e}")
        return False

    def get_likes_count(self, post_id: str) -> int:
        """Get likes count for a post"""
        container = self._get_container('likes')
        if container:
            try:
                query = "SELECT VALUE COUNT(1) FROM c WHERE c.post_id = @post_id"
                parameters = [{"name": "@post_id", "value": post_id}]
                result = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return result[0] if result else 0
            except Exception as e:
                logging.error(f"Error getting likes count: {e}")
        return 0

    # Spark operations
    def create_spark(self, spark_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a spark (like)"""
        container = self._get_container('likes')  # Using likes container for sparks
        if container:
            try:
                if 'id' not in spark_data:
                    spark_data['id'] = str(uuid.uuid4())
                spark_data['type'] = 'spark'
                return container.create_item(body=spark_data)
            except exceptions.CosmosResourceExistsError:
                raise ValueError("Spark already exists")
        return {}

    def get_sparks_by_post(self, post_id: str) -> List[Dict[str, Any]]:
        """Get all sparks for a post"""
        container = self._get_container('likes')  # Using likes container for sparks
        if container:
            try:
                query = "SELECT * FROM c WHERE c.post_id = @post_id AND c.type = 'spark'"
                parameters = [{"name": "@post_id", "value": post_id}]
                return list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
            except Exception as e:
                logging.error(f"Error getting sparks for post {post_id}: {e}")
        return []

    def check_spark_exists(self, post_id: str, user_id: str) -> bool:
        """Check if a spark exists for a post by a user"""
        container = self._get_container('likes')  # Using likes container for sparks
        if container:
            try:
                query = "SELECT VALUE COUNT(1) FROM c WHERE c.post_id = @post_id AND c.user_id = @user_id AND c.type = 'spark'"
                parameters = [
                    {"name": "@post_id", "value": post_id},
                    {"name": "@user_id", "value": user_id}
                ]
                result = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return result[0] > 0 if result else False
            except Exception as e:
                logging.error(f"Error checking spark: {e}")
        return False

    def get_sparks_count(self, post_id: str) -> int:
        """Get sparks count for a post"""
        container = self._get_container('likes')  # Using likes container for sparks
        if container:
            try:
                query = "SELECT VALUE COUNT(1) FROM c WHERE c.post_id = @post_id AND c.type = 'spark'"
                parameters = [{"name": "@post_id", "value": post_id}]
                result = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return result[0] if result else 0
            except Exception as e:
                logging.error(f"Error getting sparks count: {e}")
        return 0

    # Comment operations
    def create_comment(self, comment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a comment"""
        container = self._get_container('comments')
        if container:
            try:
                if 'id' not in comment_data:
                    comment_data['id'] = str(uuid.uuid4())
                comment_data['type'] = 'comment'
                return container.create_item(body=comment_data)
            except Exception as e:
                logging.error(f"Error creating comment: {e}")
        return {}

    def get_comments_for_post(self, post_id: str) -> List[Dict[str, Any]]:
        """Get comments for a post"""
        container = self._get_container('comments')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.post_id = @post_id ORDER BY c.created_at"
                parameters = [{"name": "@post_id", "value": post_id}]
                return list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
            except Exception as e:
                logging.error(f"Error getting comments for post {post_id}: {e}")
        return []

    def get_comments(self, post_id: str, page: int = 1, per_page: int = 10) -> List[Dict[str, Any]]:
        """Get comments for a post with pagination"""
        container = self._get_container('comments')
        if container:
            try:
                offset = (page - 1) * per_page
                query = "SELECT * FROM c WHERE c.post_id = @post_id ORDER BY c.created_at DESC OFFSET @offset LIMIT @per_page"
                parameters = [
                    {"name": "@post_id", "value": post_id},
                    {"name": "@offset", "value": offset},
                    {"name": "@per_page", "value": per_page}
                ]
                return list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
            except Exception as e:
                logging.error(f"Error getting comments for post {post_id}: {e}")
        return []

    def get_comments_by_post(self, post_id: str) -> List[Dict[str, Any]]:
        """Alias for get_comments_for_post"""
        return self.get_comments_for_post(post_id)

    # Notification operations
    def create_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a notification"""
        container = self._get_container('notifications')
        if container:
            try:
                return container.create_item(body=notification_data)
            except Exception as e:
                logging.error(f"Error creating notification: {e}")
        return {}

    def get_notifications(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get notifications for a user"""
        container = self._get_container('notifications')
        if container:
            try:
                query = f"SELECT * FROM c WHERE c.user_id = '{user_id}' ORDER BY c.created_at DESC OFFSET 0 LIMIT {limit}"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                return items
            except Exception as e:
                logging.error(f"Error getting notifications: {e}")
        return []

    def get_notification_by_id(self, notification_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a notification by ID and user ID"""
        container = self._get_container('notifications')
        if container:
            try:
                query = f"SELECT * FROM c WHERE c.id = '{notification_id}' AND c.user_id = '{user_id}'"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                return items[0] if items else None
            except Exception as e:
                logging.error(f"Error getting notification: {e}")
        return None

    def update_notification(self, notification_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a notification"""
        container = self._get_container('notifications')
        if container:
            try:
                # First get the notification to get its partition key
                query = f"SELECT * FROM c WHERE c.id = '{notification_id}'"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                if items:
                    notification = items[0]
                    for key, value in updates.items():
                        notification[key] = value
                    return container.replace_item(item=notification_id, body=notification)
            except Exception as e:
                logging.error(f"Error updating notification: {e}")
        return None

    def create_stream_chat_message(self, chat_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a stream chat message"""
        container = self._get_container('stream_chat')
        if container:
            try:
                return container.create_item(body=chat_data)
            except Exception as e:
                logging.error(f"Error creating stream chat message: {e}")
        return {}

    def get_stream_chat_messages(self, stream_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get chat messages for a stream"""
        container = self._get_container('stream_chat')
        if container:
            try:
                query = f"SELECT * FROM c WHERE c.stream_id = '{stream_id}' ORDER BY c.created_at DESC OFFSET 0 LIMIT {limit}"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                return items
            except Exception as e:
                logging.error(f"Error getting stream chat messages: {e}")
        return []

    def create_live_stream(self, stream_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a live stream"""
        container = self._get_container('streams')
        if container:
            try:
                return container.create_item(body=stream_data)
            except Exception as e:
                logging.error(f"Error creating live stream: {e}")
        return {}

    def get_active_live_stream_by_id(self, stream_id: str) -> Optional[Dict[str, Any]]:
        """Get active live stream by ID"""
        container = self._get_container('streams')
        if container:
            try:
                query = f"SELECT * FROM c WHERE c.id = '{stream_id}' AND c.is_active = true"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                return items[0] if items else None
            except Exception as e:
                logging.error(f"Error getting live stream: {e}")
        return None

    def get_active_live_streams(self) -> List[Dict[str, Any]]:
        """Get all active live streams"""
        container = self._get_container('streams')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.is_active = true ORDER BY c.created_at DESC"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                return items
            except Exception as e:
                logging.error(f"Error getting active live streams: {e}")
        return []

    def end_live_stream(self, stream_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """End a live stream"""
        container = self._get_container('streams')
        if container:
            try:
                # First get the stream
                query = f"SELECT * FROM c WHERE c.id = '{stream_id}' AND c.user_id = '{user_id}'"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                if items:
                    stream = items[0]
                    stream['is_active'] = False
                    return container.replace_item(item=stream_id, body=stream)
            except Exception as e:
                logging.error(f"Error ending live stream: {e}")
        return None

    def upsert_zodiac_dna(self, dna_data: Dict[str, Any]) -> Dict[str, Any]:
        """Upsert zodiac DNA data"""
        container = self._get_container('zodiac_dna')
        if container:
            try:
                # Check if DNA exists
                query = f"SELECT * FROM c WHERE c.user_id = '{dna_data['user_id']}' AND c.trait_name = '{dna_data['trait_name']}'"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                if items:
                    # Update existing
                    existing = items[0]
                    for key, value in dna_data.items():
                        existing[key] = value
                    return container.replace_item(item=existing['id'], body=existing)
                else:
                    # Create new
                    dna_data['id'] = str(uuid.uuid4())
                    return container.create_item(body=dna_data)
            except Exception as e:
                logging.error(f"Error upserting zodiac DNA: {e}")
        return {}

    def get_zodiac_dna_by_user_and_trait(self, user_id: str, trait_name: str) -> Optional[Dict[str, Any]]:
        """Get zodiac DNA by user and trait"""
        container = self._get_container('zodiac_dna')
        if container:
            try:
                query = f"SELECT * FROM c WHERE c.user_id = '{user_id}' AND c.trait_name = '{trait_name}'"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                return items[0] if items else None
            except Exception as e:
                logging.error(f"Error getting zodiac DNA: {e}")
        return None

    def get_zodiac_dna_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all zodiac DNA for a user"""
        container = self._get_container('zodiac_dna')
        if container:
            try:
                query = f"SELECT * FROM c WHERE c.user_id = '{user_id}'"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                return items
            except Exception as e:
                logging.error(f"Error getting zodiac DNA: {e}")
        return []

    def create_user_interaction(self, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a user interaction"""
        container = self._get_container('user_interactions')
        if container:
            try:
                interaction_data['id'] = str(uuid.uuid4())
                return container.create_item(body=interaction_data)
            except Exception as e:
                logging.error(f"Error creating user interaction: {e}")
        return {}

    def get_user_interactions(self, user_id: str, interaction_type: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user interactions"""
        container = self._get_container('user_interactions')
        if container:
            try:
                if interaction_type:
                    query = f"SELECT * FROM c WHERE c.user_id = '{user_id}' AND c.interaction_type = '{interaction_type}' ORDER BY c.created_at DESC OFFSET 0 LIMIT {limit}"
                else:
                    query = f"SELECT * FROM c WHERE c.user_id = '{user_id}' ORDER BY c.created_at DESC OFFSET 0 LIMIT {limit}"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                return items
            except Exception as e:
                logging.error(f"Error getting user interactions: {e}")
        return []

    # Post tags operations
    def create_post_tag(self, tag_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a post tag"""
        container = self._get_container('post_tags')
        if container:
            try:
                return container.create_item(body=tag_data)
            except Exception as e:
                logging.error(f"Error creating post tag: {e}")
        return {}

    # Follow operations
    def get_followers_count(self, user_id: str) -> int:
        """Get followers count for a user"""
        container = self._get_container('follows')
        if container:
            try:
                query = "SELECT VALUE COUNT(1) FROM c WHERE c.following_id = @user_id"
                parameters = [{"name": "@user_id", "value": user_id}]
                result = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return result[0] if result else 0
            except Exception as e:
                logging.error(f"Error getting followers count: {e}")
        return 0

    # Azure Blob Storage operations
    def upload_blob(self, blob_name: str, data: bytes, content_type: str = 'application/octet-stream') -> Optional[str]:
        """Upload data to Azure Blob Storage and return the blob URL"""
        if not self.blob_service_client:
            logging.error("Blob storage not initialized")
            return None

        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.blob_container_name,
                blob=blob_name
            )
            blob_client.upload_blob(data, overwrite=True, content_type=content_type)
            return blob_client.url
        except Exception as e:
            logging.error(f"Error uploading blob {blob_name}: {e}")
            return None

    def get_blob_url(self, blob_name: str) -> Optional[str]:
        """Get the public URL for a blob"""
        if not self.blob_service_client:
            logging.error("Blob storage not initialized")
            return None

        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.blob_container_name,
                blob=blob_name
            )
            return blob_client.url
        except Exception as e:
            logging.error(f"Error getting blob URL for {blob_name}: {e}")
            return None

    def delete_blob(self, blob_name: str) -> bool:
        """Delete a blob from storage"""
        if not self.blob_service_client:
            logging.error("Blob storage not initialized")
            return False

        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.blob_container_name,
                blob=blob_name
            )
            blob_client.delete_blob()
            return True
        except Exception as e:
            logging.error(f"Error deleting blob {blob_name}: {e}")
            return False

    # Analytics and Rewards Methods
    def upsert_score(self, user_id, score, stage, game_type="zodiac_arena"):
        """Store or update user score for leaderboard"""
        container = self._get_container('leaderboard')
        if not container:
            return None
        
        try:
            item = {
                'id': f"score-{user_id}-{game_type}-{stage}",
                'user_id': user_id,
                'score': score,
                'stage': stage,
                'game_type': game_type,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'partitionKey': user_id
            }
            return container.upsert_item(body=item)
        except Exception as e:
            logging.error(f"Error upserting score: {e}")
            return None

    def upsert_reward(self, user_id, item_id, reward_type, stage):
        """Store reward information"""
        container = self._get_container('rewards')
        if not container:
            return None
        
        try:
            reward = {
                'id': f"reward-{user_id}-{item_id}",
                'user_id': user_id,
                'item_id': item_id,
                'type': reward_type,
                'stage': stage,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'claimed': False,
                'partitionKey': user_id
            }
            return container.upsert_item(body=reward)
        except Exception as e:
            logging.error(f"Error upserting reward: {e}")
            return None

    def get_user_rewards(self, user_id):
        """Get all rewards for a user"""
        container = self._get_container('rewards')
        if not container:
            return []
        
        try:
            query = "SELECT * FROM c WHERE c.user_id = @user_id ORDER BY c.timestamp DESC"
            parameters = [{"name": "@user_id", "value": user_id}]
            return list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
        except Exception as e:
            logging.error(f"Error getting user rewards: {e}")
            return []

    def get_leaderboard(self, game_type="zodiac_arena", limit=100):
        """Get top scores for leaderboard"""
        container = self._get_container('leaderboard')
        if not container:
            return []
        
        try:
            query = "SELECT * FROM c WHERE c.game_type = @game_type ORDER BY c.score DESC OFFSET 0 LIMIT @limit"
            parameters = [
                {"name": "@game_type", "value": game_type},
                {"name": "@limit", "value": limit}
            ]
            return list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
        except Exception as e:
            logging.error(f"Error getting leaderboard: {e}")
            return []

    def store_analytics_event(self, event_data):
        """Store analytics event"""
        container = self._get_container('analytics_events')
        if not container:
            return None
        
        try:
            if 'id' not in event_data:
                event_data['id'] = str(uuid.uuid4())
            if 'partitionKey' not in event_data:
                event_data['partitionKey'] = event_data.get('user_id', 'anonymous')
            return container.create_item(body=event_data)
        except Exception as e:
            logging.error(f"Error storing analytics event: {e}")
            return None

    def store_user_insight(self, insight_data):
        """Store user insight data"""
        container = self._get_container('user_insights')
        if not container:
            return None
        
        try:
            if 'id' not in insight_data:
                insight_data['id'] = f"insight-{insight_data['user_id']}-{datetime.now(timezone.utc).strftime('%Y%m%d')}"
            insight_data['partitionKey'] = insight_data['user_id']
            return container.upsert_item(body=insight_data)
        except Exception as e:
            logging.error(f"Error storing user insight: {e}")
            return None

    def upload_media_to_blob(self, file, media_type='media'):
        """Upload media file to Azure Blob Storage"""
        if not self.blob_service_client:
            logging.warning(BLOB_STORAGE_NOT_INITIALIZED)
            return None
            
        try:
            # Generate unique filename
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
            blob_name = f"{media_type}/{uuid.uuid4()}/{uuid.uuid4()}.{file_extension}"
            
            # Get blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=self.blob_container_name,
                blob=blob_name
            )
            
            # Upload file
            file.seek(0)  # Reset file pointer
            blob_client.upload_blob(
                file.read(),
                content_type=file.content_type,
                overwrite=True
            )
            
            # Return public URL
            return blob_client.url
            
        except Exception as e:
            logging.error(f"Error uploading media to blob storage: {e}")
            return None

    def upload_blob(self, blob_name, data, content_type='application/octet-stream'):
        """Legacy method for uploading blob data"""
        if not self.blob_service_client:
            logging.warning(BLOB_STORAGE_NOT_INITIALIZED)
            return None
            
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.blob_container_name,
                blob=blob_name
            )
            
            blob_client.upload_blob(
                data,
                content_type=content_type,
                overwrite=True
            )
            
            return blob_client.url
            
        except Exception as e:
            logging.error(f"Error uploading blob: {e}")
            return None

    # Cosmic Intelligence - Mentor Interactions
    def create_mentor_interaction(self, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new mentor interaction record"""
        container = self._get_container('mentor_interactions')
        if container:
            try:
                # Ensure required fields
                if 'id' not in interaction_data:
                    interaction_data['id'] = str(uuid.uuid4())
                if 'timestamp' not in interaction_data:
                    interaction_data['timestamp'] = datetime.now(timezone.utc).isoformat()
                if 'user_id' not in interaction_data:
                    raise ValueError("user_id is required for mentor interactions")

                return container.create_item(body=interaction_data)
            except Exception as e:
                logging.error(f"Error creating mentor interaction: {e}")
        return {}

    def get_mentor_interactions(self, user_id: str, mentor_name: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get mentor interactions for a user"""
        container = self._get_container('mentor_interactions')
        if container:
            try:
                if mentor_name:
                    query = "SELECT * FROM c WHERE c.user_id = @user_id AND c.mentor_name = @mentor_name ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit"
                    parameters = [
                        {"name": "@user_id", "value": user_id},
                        {"name": "@mentor_name", "value": mentor_name},
                        {"name": "@limit", "value": limit}
                    ]
                else:
                    query = "SELECT * FROM c WHERE c.user_id = @user_id ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit"
                    parameters = [
                        {"name": "@user_id", "value": user_id},
                        {"name": "@limit", "value": limit}
                    ]

                return list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
            except Exception as e:
                logging.error(f"Error getting mentor interactions for user {user_id}: {e}")
        return []

    def update_mentor_interaction(self, interaction_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a mentor interaction"""
        container = self._get_container('mentor_interactions')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.id = @interaction_id"
                parameters = [{"name": "@interaction_id", "value": interaction_id}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))

                if items:
                    current_item = items[0]
                    current_item.update(updates)
                    return container.replace_item(item=current_item, body=current_item)
            except Exception as e:
                logging.error(f"Error updating mentor interaction {interaction_id}: {e}")
        return None

    # Cosmic Intelligence - Quest Progress
    def create_quest_progress(self, quest_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new quest progress record"""
        container = self._get_container('quest_progress')
        if container:
            try:
                # Ensure required fields
                if 'id' not in quest_data:
                    quest_data['id'] = str(uuid.uuid4())
                if 'user_id' not in quest_data:
                    raise ValueError("user_id is required for quest progress")
                if 'quest_id' not in quest_data:
                    raise ValueError("quest_id is required for quest progress")
                if 'started_at' not in quest_data:
                    quest_data['started_at'] = datetime.now(timezone.utc).isoformat()
                if 'status' not in quest_data:
                    quest_data['status'] = 'active'
                if 'progress' not in quest_data:
                    quest_data['progress'] = 0.0

                return container.create_item(body=quest_data)
            except Exception as e:
                logging.error(f"Error creating quest progress: {e}")
        return {}

    def get_user_quests(self, user_id: str, status: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Get quests for a user, optionally filtered by status"""
        container = self._get_container('quest_progress')
        if container:
            try:
                if status:
                    query = "SELECT * FROM c WHERE c.user_id = @user_id AND c.status = @status ORDER BY c.started_at DESC OFFSET 0 LIMIT @limit"
                    parameters = [
                        {"name": "@user_id", "value": user_id},
                        {"name": "@status", "value": status},
                        {"name": "@limit", "value": limit}
                    ]
                else:
                    query = "SELECT * FROM c WHERE c.user_id = @user_id ORDER BY c.started_at DESC OFFSET 0 LIMIT @limit"
                    parameters = [
                        {"name": "@user_id", "value": user_id},
                        {"name": "@limit", "value": limit}
                    ]

                return list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
            except Exception as e:
                logging.error(f"Error getting quests for user {user_id}: {e}")
        return []

    def update_quest_progress(self, quest_progress_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update quest progress"""
        container = self._get_container('quest_progress')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.id = @quest_progress_id"
                parameters = [{"name": "@quest_progress_id", "value": quest_progress_id}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))

                if items:
                    current_item = items[0]
                    current_item.update(updates)
                    # Update last_updated timestamp
                    current_item['last_updated'] = datetime.now(timezone.utc).isoformat()
                    return container.replace_item(item=current_item, body=current_item)
            except Exception as e:
                logging.error(f"Error updating quest progress {quest_progress_id}: {e}")
        return None

    def get_quest_by_id(self, quest_progress_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific quest progress record"""
        container = self._get_container('quest_progress')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.id = @quest_progress_id"
                parameters = [{"name": "@quest_progress_id", "value": quest_progress_id}]
                items = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
                return items[0] if items else None
            except Exception as e:
                logging.error(f"Error getting quest {quest_progress_id}: {e}")
        return None

    def complete_quest(self, quest_progress_id: str, completion_data: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        """Mark a quest as completed"""
        updates = {
            'status': 'completed',
            'completed_at': datetime.now(timezone.utc).isoformat(),
            'progress': 1.0
        }
        if completion_data:
            updates.update(completion_data)

        return self.update_quest_progress(quest_progress_id, updates)

    # Cosmic Intelligence - Lunar Cycles
    def store_lunar_data(self, lunar_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store lunar cycle data (moon phases, void periods, eclipses)"""
        container = self._get_container('lunar_cycles')
        if container:
            try:
                # Ensure required fields
                if 'id' not in lunar_data:
                    lunar_data['id'] = str(uuid.uuid4())
                if 'date' not in lunar_data:
                    lunar_data['date'] = datetime.now(timezone.utc).date().isoformat()
                if 'timestamp' not in lunar_data:
                    lunar_data['timestamp'] = datetime.now(timezone.utc).isoformat()

                return container.create_item(body=lunar_data)
            except Exception as e:
                logging.error(f"Error storing lunar data: {e}")
        return {}

    def get_lunar_data(self, start_date: str, end_date: str, data_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get lunar data for a date range, optionally filtered by type"""
        container = self._get_container('lunar_cycles')
        if container:
            try:
                if data_type:
                    query = "SELECT * FROM c WHERE c.date >= @start_date AND c.date <= @end_date AND c.type = @data_type ORDER BY c.date ASC"
                    parameters = [
                        {"name": "@start_date", "value": start_date},
                        {"name": "@end_date", "value": end_date},
                        {"name": "@data_type", "value": data_type}
                    ]
                else:
                    query = "SELECT * FROM c WHERE c.date >= @start_date AND c.date <= @end_date ORDER BY c.date ASC"
                    parameters = [
                        {"name": "@start_date", "value": start_date},
                        {"name": "@end_date", "value": end_date}
                    ]

                return list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
            except Exception as e:
                logging.error(f"Error getting lunar data: {e}")
        return []

    def get_current_moon_phase(self) -> Optional[Dict[str, Any]]:
        """Get the most recent moon phase data"""
        container = self._get_container('lunar_cycles')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.type = 'moon_phase' ORDER BY c.timestamp DESC OFFSET 0 LIMIT 1"
                items = list(container.query_items(query=query, enable_cross_partition_query=True))
                return items[0] if items else None
            except Exception as e:
                logging.error(f"Error getting current moon phase: {e}")
        return None

    def get_void_periods(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Get void of course periods for a date range"""
        return self.get_lunar_data(start_date, end_date, 'void_of_course')

    def get_upcoming_eclipses(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get upcoming eclipse data"""
        container = self._get_container('lunar_cycles')
        if container:
            try:
                query = "SELECT * FROM c WHERE c.type = 'eclipse' AND c.date >= @today ORDER BY c.date ASC OFFSET 0 LIMIT @limit"
                parameters = [
                    {"name": "@today", "value": datetime.now(timezone.utc).date().isoformat()},
                    {"name": "@limit", "value": limit}
                ]
                return list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
            except Exception as e:
                logging.error(f"Error getting upcoming eclipses: {e}")
        return []

    # Analytics and Insights for Cosmic Intelligence
    def get_user_cosmic_stats(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive cosmic statistics for a user"""
        stats = {
            'total_quests_started': 0,
            'total_quests_completed': 0,
            'completion_rate': 0.0,
            'mentor_interactions': 0,
            'favorite_mentor': None,
            'avg_quest_completion_time': 0,
            'cosmic_alignment_score': 0.0
        }

        try:
            # Quest statistics
            quests = self.get_user_quests(user_id)
            stats['total_quests_started'] = len(quests)
            completed_quests = [q for q in quests if q.get('status') == 'completed']
            stats['total_quests_completed'] = len(completed_quests)

            if stats['total_quests_started'] > 0:
                stats['completion_rate'] = stats['total_quests_completed'] / stats['total_quests_started']

            # Calculate average completion time
            completion_times = []
            for quest in completed_quests:
                if quest.get('started_at') and quest.get('completed_at'):
                    try:
                        start = datetime.fromisoformat(quest['started_at'].replace('Z', '+00:00'))
                        end = datetime.fromisoformat(quest['completed_at'].replace('Z', '+00:00'))
                        completion_times.append((end - start).days)
                    except (ValueError, TypeError):
                        pass

            if completion_times:
                stats['avg_quest_completion_time'] = sum(completion_times) / len(completion_times)

            # Mentor interaction statistics
            interactions = self.get_mentor_interactions(user_id)
            stats['mentor_interactions'] = len(interactions)

            # Find favorite mentor
            mentor_counts = {}
            for interaction in interactions:
                mentor = interaction.get('mentor_name', 'unknown')
                mentor_counts[mentor] = mentor_counts.get(mentor, 0) + 1

            if mentor_counts:
                stats['favorite_mentor'] = max(mentor_counts, key=mentor_counts.get)

            # Cosmic alignment score (simplified calculation)
            alignment_factors = [
                min(stats['completion_rate'] * 100, 100) / 100,  # Completion rate contribution
                min(stats['mentor_interactions'] / 10, 1.0),     # Interaction frequency contribution
                0.5 if stats['favorite_mentor'] else 0.0          # Mentor engagement contribution
            ]
            stats['cosmic_alignment_score'] = sum(alignment_factors) / len(alignment_factors)

        except Exception as e:
            logging.error(f"Error calculating cosmic stats for user {user_id}: {e}")

        return stats

# Global instance
_cosmos_helper = None

def get_cosmos_helper() -> CosmosDBHelper:
    """Get singleton CosmosDBHelper instance"""
    global _cosmos_helper
    if _cosmos_helper is None:
        _cosmos_helper = CosmosDBHelper()
    return _cosmos_helper