"""
Badge Processing Engine for STAR Platform
Handles badge unlocks, progress tracking, and cosmic achievements
"""

import json
import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union

from cosmos_db import get_cosmos_helper

logger = logging.getLogger(__name__)

class BadgeRarity(str, Enum):
    COMMON = 'common'
    RARE = 'rare'
    EPIC = 'epic'
    LEGENDARY = 'legendary'
    MYTHIC = 'mythic'

class BadgeCategory(str, Enum):
    ELEMENTAL_MASTERY = 'elemental_mastery'
    ZODIAC_COMPLETION = 'zodiac_completion'
    TAROT_MYSTICAL = 'tarot_mystical'
    SOCIAL_COSMIC = 'social_cosmic'
    TEMPORAL_PLANETARY = 'temporal_planetary'

class BadgeUnlockEngine:
    """Core engine for processing badge unlocks and progress"""
    
    def __init__(self):
        self.db_helper = get_cosmos_helper()
        self.badge_manifests = self._load_badge_manifests()
        
    def _load_badge_manifests(self) -> Dict[str, Any]:
        """Load all active badge manifests from database"""
        try:
            manifests = {}
            container = self.db_helper.get_container('badge_manifests')
            
            query = "SELECT * FROM c WHERE c.active = true"
            items = list(container.query_items(query=query, enable_cross_partition_query=True))
            
            for item in items:
                manifests[item['id']] = item['manifest']
                
            logger.info(f"Loaded {len(manifests)} badge manifests")
            return manifests
            
        except Exception as e:
            logger.error(f"Failed to load badge manifests: {e}")
            return self._get_default_manifests()

    def _get_default_manifests(self) -> Dict[str, Any]:
        """Fallback badge manifests for system resilience"""
        return {
            'fire_element_master': {
                'metadata': {
                    'id': 'fire_element_master',
                    'name': '🔥 Fire Element Master',
                    'description': 'You have unlocked the secrets of cosmic fire - passion, creation, and transformation flow through your digital essence.',
                    'category': 'elemental_mastery',
                    'tradition': 'western'
                },
                'unlock_conditions': {
                    'type': 'combo',
                    'logic_operator': 'AND',
                    'conditions': [
                        {
                            'condition_type': 'posts_by_element',
                            'target_value': 10,
                            'description': 'Create 10 posts as fire signs (Aries, Leo, Sagittarius)'
                        },
                        {
                            'condition_type': 'fire_sign_interactions',
                            'target_value': 50,
                            'description': '50+ interactions with fire sign users'
                        }
                    ]
                },
                'rarity': BadgeRarity.EPIC,
                'effects': {
                    'cosmic_influence': {
                        'fire_energy_boost': 1.25,
                        'passion_multiplier': 1.15
                    }
                }
            },
            'tarot_adept': {
                'metadata': {
                    'id': 'tarot_adept',
                    'name': '🎴 Tarot Adept',
                    'description': 'The cards have revealed their secrets to you. Your intuition has awakened to the cosmic currents.',
                    'category': 'tarot_mystical'
                },
                'unlock_conditions': {
                    'type': 'milestone',
                    'logic_operator': 'AND',
                    'conditions': [
                        {
                            'condition_type': 'tarot_readings_completed',
                            'target_value': 5,
                            'description': 'Complete 5 tarot readings'
                        }
                    ]
                },
                'rarity': BadgeRarity.RARE
            }
        }

    async def check_user_badge_unlocks(self, user_id: str) -> List[Dict[str, Any]]:
        """Check all possible badge unlocks for a user and return newly unlocked badges"""
        try:
            user_progress = await self._get_user_progress(user_id)
            user_stats = await self._get_user_stats(user_id)
            newly_unlocked = []

            for badge_id, manifest in self.badge_manifests.items():
                # Skip if already unlocked
                if self._is_badge_unlocked(user_progress, badge_id):
                    continue

                # Check unlock conditions
                if await self._check_unlock_conditions(user_id, manifest, user_stats):
                    unlock_result = await self._unlock_badge(user_id, badge_id, manifest)
                    if unlock_result:
                        newly_unlocked.append(unlock_result)

            return newly_unlocked

        except Exception as e:
            logger.error(f"Error checking badge unlocks for user {user_id}: {e}")
            return []

    async def _get_user_progress(self, user_id: str) -> Dict[str, Any]:
        """Get user's current badge progress"""
        try:
            container = self.db_helper.get_container('user_badges')
            query = "SELECT * FROM c WHERE c.user_id = @user_id"
            parameters = [{"name": "@user_id", "value": user_id}]
            
            items = list(container.query_items(
                query=query,
                parameters=parameters,
                partition_key=user_id
            ))
            
            progress = {}
            for item in items:
                progress[item['badge_id']] = item
                
            return progress

        except Exception as e:
            logger.error(f"Error getting user progress for {user_id}: {e}")
            return {}

    async def _get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Aggregate user statistics for badge condition checking"""
        try:
            stats = {
                'posts_by_sign': {},
                'interactions_by_element': {},
                'tarot_readings_count': 0,
                'sign_interactions': {},
                'join_date': None,
                'current_streak': 0,
                'total_posts': 0,
                'total_likes_received': 0,
                'collaborations_created': 0
            }

            # Get user profile
            users_container = self.db_helper.get_container('users')
            user = users_container.read_item(item=user_id, partition_key=user_id)
            if user:
                stats['zodiac_sign'] = user.get('zodiac_sign')
                stats['join_date'] = user.get('created_at')

            # Count posts by zodiac sign
            posts_container = self.db_helper.get_container('posts')
            posts_query = "SELECT * FROM c WHERE c.user_id = @user_id"
            posts_params = [{"name": "@user_id", "value": user_id}]
            
            user_posts = list(posts_container.query_items(
                query=posts_query,
                parameters=posts_params,
                enable_cross_partition_query=True
            ))

            # Aggregate post statistics
            for post in user_posts:
                sign = post.get('zodiac_sign', 'unknown')
                stats['posts_by_sign'][sign] = stats['posts_by_sign'].get(sign, 0) + 1
                stats['total_posts'] += 1

            # Count tarot readings (if tarot_readings container exists)
            try:
                tarot_container = self.db_helper.get_container('tarot_readings')
                tarot_query = "SELECT VALUE COUNT(1) FROM c WHERE c.user_id = @user_id"
                tarot_count = list(tarot_container.query_items(
                    query=tarot_query,
                    parameters=posts_params,
                    enable_cross_partition_query=True
                ))
                if tarot_count:
                    stats['tarot_readings_count'] = tarot_count[0]
            except:
                stats['tarot_readings_count'] = 0

            return stats

        except Exception as e:
            logger.error(f"Error getting user stats for {user_id}: {e}")
            return {}

    def _is_badge_unlocked(self, user_progress: Dict[str, Any], badge_id: str) -> bool:
        """Check if user has already unlocked a badge"""
        return badge_id in user_progress and user_progress[badge_id].get('status') == 'unlocked'

    async def _check_unlock_conditions(self, user_id: str, manifest: Dict[str, Any], user_stats: Dict[str, Any]) -> bool:
        """Check if user meets all conditions for badge unlock"""
        try:
            conditions = manifest.get('unlock_conditions', {})
            logic_operator = conditions.get('logic_operator', 'AND')
            condition_list = conditions.get('conditions', [])

            results = []
            
            for condition in condition_list:
                condition_type = condition['condition_type']
                target_value = condition['target_value']
                
                result = await self._evaluate_condition(condition_type, target_value, user_stats, user_id)
                results.append(result)

            # Apply logic operator
            if logic_operator == 'AND':
                return all(results)
            elif logic_operator == 'OR':
                return any(results)
            else:
                return False

        except Exception as e:
            logger.error(f"Error checking unlock conditions: {e}")
            return False

    async def _evaluate_condition(self, condition_type: str, target_value: Union[int, str, bool], 
                                 user_stats: Dict[str, Any], user_id: str) -> bool:
        """Evaluate individual unlock condition"""
        try:
            if condition_type == 'posts_by_element':
                # Count posts by fire signs (Aries, Leo, Sagittarius)
                fire_signs = ['Aries', 'Leo', 'Sagittarius']
                fire_posts = sum(user_stats['posts_by_sign'].get(sign, 0) for sign in fire_signs)
                return fire_posts >= target_value

            elif condition_type == 'tarot_readings_completed':
                return user_stats['tarot_readings_count'] >= target_value

            elif condition_type == 'total_posts':
                return user_stats['total_posts'] >= target_value

            elif condition_type == 'account_age_days':
                if user_stats['join_date']:
                    join_date = datetime.fromisoformat(user_stats['join_date'].replace('Z', '+00:00'))
                    days_active = (datetime.now(timezone.utc) - join_date).days
                    return days_active >= target_value

            elif condition_type == 'fire_sign_interactions':
                # This would require more complex interaction tracking
                # For now, return True if user has posted as fire signs
                fire_signs = ['Aries', 'Leo', 'Sagittarius']
                fire_posts = sum(user_stats['posts_by_sign'].get(sign, 0) for sign in fire_signs)
                return fire_posts >= (target_value / 10)  # Simplified calculation

            elif condition_type == 'active_during_eclipse':
                # This would require real-time astronomical data
                # For demo, return False (eclipse badges are special events)
                return False

            else:
                logger.warning(f"Unknown condition type: {condition_type}")
                return False

        except Exception as e:
            logger.error(f"Error evaluating condition {condition_type}: {e}")
            return False

    async def _unlock_badge(self, user_id: str, badge_id: str, manifest: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Unlock a badge for a user"""
        try:
            container = self.db_helper.get_container('user_badges')
            
            badge_record = {
                'id': f"{user_id}_{badge_id}",
                'partition_key': user_id,
                'user_id': user_id,
                'badge_id': badge_id,
                'status': 'unlocked',
                'unlocked_at': datetime.now(timezone.utc).isoformat(),
                'equipped': False,  # User can choose to display
                'display_order': 999,  # Default order
                'manifest': manifest  # Store manifest snapshot
            }

            container.upsert_item(badge_record)
            
            logger.info(f"Unlocked badge {badge_id} for user {user_id}")
            
            return {
                'badge_id': badge_id,
                'name': manifest['metadata']['name'],
                'description': manifest['metadata']['description'],
                'rarity': manifest.get('rarity', BadgeRarity.COMMON),
                'unlocked_at': badge_record['unlocked_at']
            }

        except Exception as e:
            logger.error(f"Error unlocking badge {badge_id} for user {user_id}: {e}")
            return None

    async def get_user_badges(self, user_id: str, include_locked: bool = False) -> Dict[str, Any]:
        """Get user's badge collection with progress"""
        try:
            user_progress = await self._get_user_progress(user_id)
            
            result = {
                'unlocked_badges': [],
                'equipped_badges': [],
                'locked_badges': [],
                'total_count': len(self.badge_manifests),
                'unlocked_count': len([b for b in user_progress.values() if b.get('status') == 'unlocked']),
                'rarity_breakdown': {rarity.value: 0 for rarity in BadgeRarity}
            }

            # Process unlocked badges
            for badge_id, progress in user_progress.items():
                if progress.get('status') == 'unlocked':
                    badge_data = {
                        'badge_id': badge_id,
                        'manifest': progress.get('manifest', {}),
                        'unlocked_at': progress.get('unlocked_at'),
                        'equipped': progress.get('equipped', False)
                    }
                    
                    result['unlocked_badges'].append(badge_data)
                    
                    if badge_data['equipped']:
                        result['equipped_badges'].append(badge_data)
                    
                    # Count by rarity
                    rarity = progress.get('manifest', {}).get('rarity', BadgeRarity.COMMON)
                    if rarity in result['rarity_breakdown']:
                        result['rarity_breakdown'][rarity] += 1

            # Add locked badges if requested
            if include_locked:
                for badge_id, manifest in self.badge_manifests.items():
                    if badge_id not in user_progress:
                        result['locked_badges'].append({
                            'badge_id': badge_id,
                            'manifest': manifest,
                            'locked': True
                        })

            return result

        except Exception as e:
            logger.error(f"Error getting user badges for {user_id}: {e}")
            return {'unlocked_badges': [], 'equipped_badges': [], 'locked_badges': []}

# Singleton instance
badge_engine = BadgeUnlockEngine()