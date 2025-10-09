import os
import logging
import uuid
from typing import List, Dict, Any, Optional
from azure.cosmos import CosmosClient, exceptions
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure_config import get_cosmos_client, get_azure_config

class CosmosDBHelper:
    """Helper class for Azure Cosmos DB operations"""

    def __init__(self):
        self.config = get_azure_config()
        self.client = get_cosmos_client()
        self.database_name = self.config['cosmos_database']
        self.database = None
        self.containers = {}

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
        container_names = ['users', 'posts', 'chats', 'follows', 'likes', 'comments', 'profiles', 'notifications', 'stream_chat', 'streams', 'zodiac_dna', 'user_interactions']
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
        if self.containers.get(container_name) is None:
            try:
                self.containers[container_name] = self.database.get_container_client(container_name)
            except exceptions.CosmosResourceNotFoundError:
                logging.error(f"Container {container_name} does not exist")
                return None
        return self.containers[container_name]

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

    # Comment operations
    def create_comment(self, comment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a comment"""
        container = self._get_container('comments')
        if container:
            try:
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

# Global instance
_cosmos_helper = None

def get_cosmos_helper() -> CosmosDBHelper:
    """Get singleton CosmosDBHelper instance"""
    global _cosmos_helper
    if _cosmos_helper is None:
        _cosmos_helper = CosmosDBHelper()
    return _cosmos_helper