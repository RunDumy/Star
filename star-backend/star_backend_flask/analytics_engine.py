"""
STAR Platform Analytics Engine
===========================

Comprehensive analytics system for tracking user engagement, cosmic patterns, 
and generating predictive insights for personalized user experience.

Features:
- User engagement tracking and behavioral analysis
- Cosmic pattern analysis across zodiac signs and actions
- Predictive insights for tarot readings and numerology
- Personalization engine for content recommendations
- Performance metrics and platform health monitoring
- Data aggregation and trend analysis
"""

import json
import logging
import math
import statistics
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from flask import current_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EngagementType(Enum):
    """Types of user engagement events"""
    LOGIN = "login"
    POST_VIEW = "post_view"
    POST_LIKE = "post_like"
    POST_COMMENT = "post_comment"
    POST_CREATE = "post_create"
    TAROT_DRAW = "tarot_draw"
    NUMEROLOGY_CALC = "numerology_calc"
    PROFILE_VIEW = "profile_view"
    PROFILE_UPDATE = "profile_update"
    COLLABORATION_JOIN = "collaboration_join"
    VOICE_CHAT = "voice_chat"
    BADGE_UNLOCK = "badge_unlock"
    SPOTIFY_PLAY = "spotify_play"
    COSMOS_NAVIGATION = "cosmos_navigation"
    FEED_SCROLL = "feed_scroll"
    SEARCH_QUERY = "search_query"

class CosmicPattern(Enum):
    """Cosmic patterns for analysis"""
    ELEMENTAL_AFFINITY = "elemental_affinity"
    ZODIAC_COMPATIBILITY = "zodiac_compatibility"
    LUNAR_CYCLE_ACTIVITY = "lunar_cycle_activity"
    SEASONAL_TRENDS = "seasonal_trends"
    TIME_OF_DAY_PATTERNS = "time_of_day_patterns"
    TAROT_CARD_FREQUENCY = "tarot_card_frequency"
    NUMEROLOGY_PATTERNS = "numerology_patterns"
    SOCIAL_INTERACTION_STYLE = "social_interaction_style"

@dataclass
class EngagementEvent:
    """Individual engagement event"""
    user_id: str
    event_type: EngagementType
    timestamp: datetime
    metadata: Dict[str, Any]
    session_id: Optional[str] = None
    duration: Optional[float] = None  # in seconds
    zodiac_signs: Optional[Dict[str, str]] = None
    location: Optional[Dict[str, str]] = None

@dataclass
class UserInsight:
    """User-specific insights and patterns"""
    user_id: str
    engagement_score: float  # 0-100
    active_hours: List[int]  # preferred hours of activity
    favorite_elements: List[str]
    cosmic_affinity: Dict[str, float]
    predicted_interests: List[str]
    recommendation_tags: List[str]
    last_updated: datetime

@dataclass
class CosmicTrend:
    """Platform-wide cosmic trends"""
    pattern_type: CosmicPattern
    trend_data: Dict[str, float]
    confidence_score: float
    time_range: Tuple[datetime, datetime]
    affected_users: int
    correlation_factors: List[str]

class AnalyticsEngine:
    """
    Core analytics engine for STAR platform
    """
    
    def __init__(self, cosmos_helper=None):
        """Initialize analytics engine"""
        self.cosmos_helper = cosmos_helper
        self.engagement_cache = []
        self.insights_cache = {}
        self.trends_cache = {}
        
        # Element and zodiac mappings
        self.ELEMENTS = {
            'fire': ['aries', 'leo', 'sagittarius'],
            'earth': ['taurus', 'virgo', 'capricorn'],
            'air': ['gemini', 'libra', 'aquarius'],
            'water': ['cancer', 'scorpio', 'pisces']
        }
        
        self.ZODIAC_COMPATIBILITY = {
            'fire': {'fire': 0.9, 'air': 0.8, 'earth': 0.4, 'water': 0.3},
            'earth': {'earth': 0.9, 'water': 0.8, 'air': 0.4, 'fire': 0.3},
            'air': {'air': 0.9, 'fire': 0.8, 'water': 0.4, 'earth': 0.3},
            'water': {'water': 0.9, 'earth': 0.8, 'fire': 0.4, 'air': 0.3}
        }
        
        logger.info("Analytics Engine initialized")
    
    async def track_engagement(self, event: EngagementEvent) -> bool:
        """
        Track user engagement event
        """
        try:
            # Add to cache for real-time processing
            self.engagement_cache.append(event)
            
            # Store in database
            if self.cosmos_helper:
                container = self.cosmos_helper.get_container('analytics_events')
                event_doc = {
                    'id': f"{event.user_id}_{event.timestamp.isoformat()}_{event.event_type.value}",
                    'user_id': event.user_id,
                    'event_type': event.event_type.value,
                    'timestamp': event.timestamp.isoformat(),
                    'metadata': event.metadata,
                    'session_id': event.session_id,
                    'duration': event.duration,
                    'zodiac_signs': event.zodiac_signs,
                    'location': event.location,
                    'date_partition': event.timestamp.date().isoformat()
                }
                
                container.create_item(body=event_doc)
            
            # Process cache if it gets large
            if len(self.engagement_cache) > 100:
                await self._process_engagement_cache()
            
            logger.info(f"Tracked engagement: {event.event_type.value} for user {event.user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error tracking engagement: {e}")
            return False
    
    async def _process_engagement_cache(self):
        """Process cached engagement events"""
        try:
            for event in self.engagement_cache:
                await self._update_user_insights(event)
            
            self.engagement_cache.clear()
            logger.info("Processed engagement cache")
            
        except Exception as e:
            logger.error(f"Error processing engagement cache: {e}")
    
    async def _update_user_insights(self, event: EngagementEvent):
        """Update user insights based on engagement event"""
        try:
            user_id = event.user_id
            
            # Get existing insights or create new
            if user_id in self.insights_cache:
                insights = self.insights_cache[user_id]
            else:
                insights = await self._get_user_insights(user_id)
                if not insights:
                    insights = UserInsight(
                        user_id=user_id,
                        engagement_score=50.0,
                        active_hours=[],
                        favorite_elements=[],
                        cosmic_affinity={},
                        predicted_interests=[],
                        recommendation_tags=[],
                        last_updated=datetime.utcnow()
                    )
            
            # Update engagement score
            insights.engagement_score = self._calculate_engagement_score(user_id, event)
            
            # Update active hours
            hour = event.timestamp.hour
            if hour not in insights.active_hours:
                insights.active_hours.append(hour)
            
            # Update cosmic affinity based on zodiac and actions
            if event.zodiac_signs:
                await self._update_cosmic_affinity(insights, event)
            
            # Update predicted interests
            insights.predicted_interests = await self._predict_user_interests(user_id, event)
            
            # Update recommendation tags
            insights.recommendation_tags = await self._generate_recommendation_tags(insights)
            
            insights.last_updated = datetime.utcnow()
            
            # Cache and store
            self.insights_cache[user_id] = insights
            await self._store_user_insights(insights)
            
        except Exception as e:
            logger.error(f"Error updating user insights: {e}")
    
    def _calculate_engagement_score(self, user_id: str, event: EngagementEvent) -> float:
        """Calculate user engagement score based on recent activity"""
        try:
            # Base scoring system
            event_scores = {
                EngagementType.LOGIN: 5,
                EngagementType.POST_CREATE: 15,
                EngagementType.POST_COMMENT: 10,
                EngagementType.POST_LIKE: 3,
                EngagementType.TAROT_DRAW: 12,
                EngagementType.NUMEROLOGY_CALC: 8,
                EngagementType.COLLABORATION_JOIN: 20,
                EngagementType.VOICE_CHAT: 25,
                EngagementType.BADGE_UNLOCK: 18,
                EngagementType.SPOTIFY_PLAY: 5,
                EngagementType.COSMOS_NAVIGATION: 7,
                EngagementType.FEED_SCROLL: 2,
                EngagementType.PROFILE_UPDATE: 10
            }
            
            base_score = event_scores.get(event.event_type, 1)
            
            # Time decay factor (recent activity weighted more)
            hours_ago = (datetime.utcnow() - event.timestamp).total_seconds() / 3600
            time_factor = max(0.1, 1.0 - (hours_ago / 24.0))  # Decay over 24 hours
            
            # Duration bonus for longer engagement
            duration_bonus = 1.0
            if event.duration:
                duration_bonus = min(2.0, 1.0 + (event.duration / 300))  # Up to 2x for 5+ minutes
            
            score = base_score * time_factor * duration_bonus
            
            # Get current score from cache or default
            current_score = 50.0
            if user_id in self.insights_cache:
                current_score = self.insights_cache[user_id].engagement_score
            
            # Weighted average with current score
            new_score = (current_score * 0.8) + (score * 0.2)
            
            return min(100.0, max(0.0, new_score))
            
        except Exception as e:
            logger.error(f"Error calculating engagement score: {e}")
            return 50.0
    
    async def _update_cosmic_affinity(self, insights: UserInsight, event: EngagementEvent):
        """Update user's cosmic affinities based on activity"""
        try:
            if not event.zodiac_signs:
                return
            
            # Get user's primary element
            western_sign = event.zodiac_signs.get('western', '').lower()
            user_element = None
            for element, signs in self.ELEMENTS.items():
                if western_sign in signs:
                    user_element = element
                    break
            
            if not user_element:
                return
            
            # Update elemental affinity based on event type
            if user_element not in insights.cosmic_affinity:
                insights.cosmic_affinity[user_element] = 0.5
            
            # Boost affinity for engaging activities
            engagement_boost = {
                EngagementType.TAROT_DRAW: 0.05,
                EngagementType.NUMEROLOGY_CALC: 0.03,
                EngagementType.POST_CREATE: 0.04,
                EngagementType.COLLABORATION_JOIN: 0.06,
                EngagementType.VOICE_CHAT: 0.07
            }
            
            boost = engagement_boost.get(event.event_type, 0.01)
            insights.cosmic_affinity[user_element] = min(1.0, 
                insights.cosmic_affinity[user_element] + boost)
            
            # Update favorite elements list
            sorted_elements = sorted(insights.cosmic_affinity.items(), 
                                   key=lambda x: x[1], reverse=True)
            insights.favorite_elements = [elem[0] for elem in sorted_elements[:3]]
            
        except Exception as e:
            logger.error(f"Error updating cosmic affinity: {e}")
    
    async def _predict_user_interests(self, user_id: str, event: EngagementEvent) -> List[str]:
        """Predict user interests based on engagement patterns"""
        try:
            interests = []
            
            # Get recent engagement history
            recent_events = await self._get_recent_events(user_id, days=7)
            event_counts = Counter([e['event_type'] for e in recent_events])
            
            # Predict interests based on activity patterns
            if event_counts.get('tarot_draw', 0) > 3:
                interests.append('divination')
                interests.append('self_reflection')
            
            if event_counts.get('numerology_calc', 0) > 2:
                interests.append('numerology')
                interests.append('cosmic_timing')
            
            if event_counts.get('collaboration_join', 0) > 1:
                interests.append('community')
                interests.append('shared_experiences')
            
            if event_counts.get('spotify_play', 0) > 5:
                interests.append('music')
                interests.append('mood_enhancement')
            
            if event_counts.get('voice_chat', 0) > 0:
                interests.append('social_connection')
                interests.append('real_time_interaction')
            
            # Add zodiac-based interests
            if event.zodiac_signs:
                western_sign = event.zodiac_signs.get('western', '').lower()
                zodiac_interests = {
                    'aries': ['leadership', 'competition', 'new_beginnings'],
                    'taurus': ['stability', 'material_comfort', 'sensory_experiences'],
                    'gemini': ['communication', 'learning', 'variety'],
                    'cancer': ['emotional_depth', 'nurturing', 'intuition'],
                    'leo': ['creativity', 'self_expression', 'recognition'],
                    'virgo': ['organization', 'improvement', 'service'],
                    'libra': ['harmony', 'relationships', 'beauty'],
                    'scorpio': ['transformation', 'mystery', 'intensity'],
                    'sagittarius': ['adventure', 'philosophy', 'exploration'],
                    'capricorn': ['achievement', 'structure', 'ambition'],
                    'aquarius': ['innovation', 'independence', 'humanitarian'],
                    'pisces': ['spirituality', 'imagination', 'compassion']
                }
                
                interests.extend(zodiac_interests.get(western_sign, []))
            
            return list(set(interests))[:10]  # Return unique interests, max 10
            
        except Exception as e:
            logger.error(f"Error predicting user interests: {e}")
            return []
    
    async def _generate_recommendation_tags(self, insights: UserInsight) -> List[str]:
        """Generate recommendation tags for content personalization"""
        try:
            tags = []
            
            # Element-based tags
            for element in insights.favorite_elements:
                tags.append(f"element_{element}")
                tags.append(f"{element}_energy")
            
            # Interest-based tags
            for interest in insights.predicted_interests:
                tags.append(f"interest_{interest}")
            
            # Engagement-based tags
            if insights.engagement_score > 80:
                tags.append("high_engagement")
                tags.append("power_user")
            elif insights.engagement_score > 60:
                tags.append("regular_user")
                tags.append("engaged")
            else:
                tags.append("casual_user")
                tags.append("encouragement_needed")
            
            # Time-based tags
            active_times = []
            for hour in insights.active_hours:
                if 6 <= hour < 12:
                    active_times.append("morning_person")
                elif 12 <= hour < 18:
                    active_times.append("afternoon_active")
                elif 18 <= hour < 24:
                    active_times.append("evening_person")
                else:
                    active_times.append("night_owl")
            
            tags.extend(list(set(active_times)))
            
            return list(set(tags))[:15]  # Return unique tags, max 15
            
        except Exception as e:
            logger.error(f"Error generating recommendation tags: {e}")
            return []
    
    async def analyze_cosmic_patterns(self, pattern_type: CosmicPattern, 
                                    time_range: Optional[Tuple[datetime, datetime]] = None) -> CosmicTrend:
        """Analyze cosmic patterns across the platform"""
        try:
            if not time_range:
                end_time = datetime.utcnow()
                start_time = end_time - timedelta(days=30)
                time_range = (start_time, end_time)
            
            if pattern_type == CosmicPattern.ELEMENTAL_AFFINITY:
                return await self._analyze_elemental_patterns(time_range)
            elif pattern_type == CosmicPattern.ZODIAC_COMPATIBILITY:
                return await self._analyze_compatibility_patterns(time_range)
            elif pattern_type == CosmicPattern.LUNAR_CYCLE_ACTIVITY:
                return await self._analyze_lunar_patterns(time_range)
            elif pattern_type == CosmicPattern.SEASONAL_TRENDS:
                return await self._analyze_seasonal_patterns(time_range)
            elif pattern_type == CosmicPattern.TIME_OF_DAY_PATTERNS:
                return await self._analyze_daily_patterns(time_range)
            elif pattern_type == CosmicPattern.TAROT_CARD_FREQUENCY:
                return await self._analyze_tarot_patterns(time_range)
            else:
                logger.warning(f"Unknown pattern type: {pattern_type}")
                return CosmicTrend(
                    pattern_type=pattern_type,
                    trend_data={},
                    confidence_score=0.0,
                    time_range=time_range,
                    affected_users=0,
                    correlation_factors=[]
                )
                
        except Exception as e:
            logger.error(f"Error analyzing cosmic patterns: {e}")
            return CosmicTrend(
                pattern_type=pattern_type,
                trend_data={},
                confidence_score=0.0,
                time_range=time_range,
                affected_users=0,
                correlation_factors=[]
            )
    
    async def _analyze_elemental_patterns(self, time_range: Tuple[datetime, datetime]) -> CosmicTrend:
        """Analyze elemental engagement patterns"""
        try:
            events = await self._get_events_in_range(time_range)
            element_activity = defaultdict(int)
            element_users = defaultdict(set)
            
            for event in events:
                if event.get('zodiac_signs') and event.get('zodiac_signs').get('western'):
                    western_sign = event['zodiac_signs']['western'].lower()
                    for element, signs in self.ELEMENTS.items():
                        if western_sign in signs:
                            element_activity[element] += 1
                            element_users[element].add(event['user_id'])
                            break
            
            # Calculate percentages
            total_activity = sum(element_activity.values())
            trend_data = {}
            if total_activity > 0:
                for element, count in element_activity.items():
                    trend_data[element] = (count / total_activity) * 100
            
            # Calculate confidence based on sample size
            confidence_score = min(1.0, total_activity / 1000)  # High confidence at 1000+ events
            
            return CosmicTrend(
                pattern_type=CosmicPattern.ELEMENTAL_AFFINITY,
                trend_data=trend_data,
                confidence_score=confidence_score,
                time_range=time_range,
                affected_users=sum(len(users) for users in element_users.values()),
                correlation_factors=['zodiac_sign', 'seasonal_energy', 'user_preferences']
            )
            
        except Exception as e:
            logger.error(f"Error analyzing elemental patterns: {e}")
            return CosmicTrend(
                pattern_type=CosmicPattern.ELEMENTAL_AFFINITY,
                trend_data={},
                confidence_score=0.0,
                time_range=time_range,
                affected_users=0,
                correlation_factors=[]
            )
    
    async def _analyze_daily_patterns(self, time_range: Tuple[datetime, datetime]) -> CosmicTrend:
        """Analyze time-of-day activity patterns"""
        try:
            events = await self._get_events_in_range(time_range)
            hourly_activity = defaultdict(int)
            
            for event in events:
                # Parse timestamp if it's a string
                if isinstance(event.get('timestamp'), str):
                    timestamp = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00'))
                else:
                    timestamp = event.get('timestamp', datetime.utcnow())
                
                hour = timestamp.hour
                hourly_activity[hour] += 1
            
            # Convert to percentages
            total_activity = sum(hourly_activity.values())
            trend_data = {}
            if total_activity > 0:
                for hour in range(24):
                    count = hourly_activity.get(hour, 0)
                    trend_data[f"hour_{hour:02d}"] = (count / total_activity) * 100
            
            # Calculate confidence
            confidence_score = min(1.0, total_activity / 500)
            
            return CosmicTrend(
                pattern_type=CosmicPattern.TIME_OF_DAY_PATTERNS,
                trend_data=trend_data,
                confidence_score=confidence_score,
                time_range=time_range,
                affected_users=len(set(event.get('user_id') for event in events if event.get('user_id'))),
                correlation_factors=['timezone', 'work_schedule', 'lifestyle']
            )
            
        except Exception as e:
            logger.error(f"Error analyzing daily patterns: {e}")
            return CosmicTrend(
                pattern_type=CosmicPattern.TIME_OF_DAY_PATTERNS,
                trend_data={},
                confidence_score=0.0,
                time_range=time_range,
                affected_users=0,
                correlation_factors=[]
            )
    
    async def get_user_recommendations(self, user_id: str, 
                                     recommendation_type: str = "general") -> Dict[str, Any]:
        """Generate personalized recommendations for user"""
        try:
            insights = await self._get_user_insights(user_id)
            if not insights:
                return {'recommendations': [], 'reason': 'insufficient_data'}
            
            recommendations = []
            
            if recommendation_type == "content":
                recommendations = await self._get_content_recommendations(insights)
            elif recommendation_type == "social":
                recommendations = await self._get_social_recommendations(insights)
            elif recommendation_type == "cosmic":
                recommendations = await self._get_cosmic_recommendations(insights)
            else:  # general
                recommendations.extend(await self._get_content_recommendations(insights)[:3])
                recommendations.extend(await self._get_social_recommendations(insights)[:3])
                recommendations.extend(await self._get_cosmic_recommendations(insights)[:4])
            
            return {
                'recommendations': recommendations,
                'user_insights': {
                    'engagement_score': insights.engagement_score,
                    'favorite_elements': insights.favorite_elements,
                    'predicted_interests': insights.predicted_interests[:5],
                    'active_hours': insights.active_hours[:5]
                },
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return {'recommendations': [], 'error': str(e)}
    
    async def _get_content_recommendations(self, insights: UserInsight) -> List[Dict[str, Any]]:
        """Get content-based recommendations"""
        recommendations = []
        
        # Tarot recommendations based on interests
        if 'divination' in insights.predicted_interests:
            recommendations.append({
                'type': 'tarot_spread',
                'title': 'Celtic Cross Reading',
                'description': 'Deep dive into your current situation',
                'confidence': 0.8,
                'tags': ['divination', 'self_reflection']
            })
        
        # Numerology recommendations
        if 'numerology' in insights.predicted_interests:
            recommendations.append({
                'type': 'numerology_reading',
                'title': 'Personal Year Analysis',
                'description': 'Discover your cosmic timing for this year',
                'confidence': 0.7,
                'tags': ['numerology', 'cosmic_timing']
            })
        
        # Element-based content
        for element in insights.favorite_elements[:2]:
            recommendations.append({
                'type': 'elemental_content',
                'title': f'{element.title()} Element Deep Dive',
                'description': f'Explore the power of {element} energy',
                'confidence': 0.6,
                'tags': [f'element_{element}', f'{element}_energy']
            })
        
        return recommendations
    
    async def _get_social_recommendations(self, insights: UserInsight) -> List[Dict[str, Any]]:
        """Get social-based recommendations"""
        recommendations = []
        
        if 'community' in insights.predicted_interests:
            recommendations.append({
                'type': 'collaboration',
                'title': 'Join Group Tarot Session',
                'description': 'Connect with others for shared readings',
                'confidence': 0.9,
                'tags': ['community', 'shared_experiences']
            })
        
        if insights.engagement_score > 70:
            recommendations.append({
                'type': 'mentor_opportunity',
                'title': 'Become a Cosmic Mentor',
                'description': 'Guide newcomers on their journey',
                'confidence': 0.8,
                'tags': ['leadership', 'mentoring']
            })
        
        return recommendations
    
    async def _get_cosmic_recommendations(self, insights: UserInsight) -> List[Dict[str, Any]]:
        """Get cosmic-based recommendations"""
        recommendations = []
        
        # Time-based recommendations
        current_hour = datetime.utcnow().hour
        if current_hour in insights.active_hours:
            recommendations.append({
                'type': 'optimal_timing',
                'title': 'Perfect Time for Cosmic Work',
                'description': 'Your energy is aligned for spiritual practice',
                'confidence': 0.7,
                'tags': ['optimal_timing', 'energy_alignment']
            })
        
        # Element-based cosmic work
        for element in insights.favorite_elements[:2]:
            recommendations.append({
                'type': 'elemental_ritual',
                'title': f'{element.title()} Element Ritual',
                'description': f'Harness {element} energy for manifestation',
                'confidence': 0.6,
                'tags': [f'element_{element}', 'ritual', 'manifestation']
            })
        
        return recommendations
    
    async def get_platform_analytics(self, time_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """Get comprehensive platform analytics"""
        try:
            if not time_range:
                end_time = datetime.utcnow()
                start_time = end_time - timedelta(days=7)
                time_range = (start_time, end_time)
            
            # Get basic metrics
            events = await self._get_events_in_range(time_range)
            
            total_events = len(events)
            unique_users = len(set(event.get('user_id') for event in events if event.get('user_id')))
            
            # Event type distribution
            event_types = Counter(event.get('event_type') for event in events)
            
            # Calculate engagement metrics
            avg_engagement = await self._calculate_average_engagement(time_range)
            
            # Get cosmic patterns
            elemental_trend = await self.analyze_cosmic_patterns(CosmicPattern.ELEMENTAL_AFFINITY, time_range)
            daily_trend = await self.analyze_cosmic_patterns(CosmicPattern.TIME_OF_DAY_PATTERNS, time_range)
            
            return {
                'time_range': {
                    'start': time_range[0].isoformat(),
                    'end': time_range[1].isoformat()
                },
                'basic_metrics': {
                    'total_events': total_events,
                    'unique_users': unique_users,
                    'events_per_user': total_events / max(1, unique_users),
                    'average_engagement_score': avg_engagement
                },
                'event_distribution': dict(event_types),
                'cosmic_patterns': {
                    'elemental_affinity': elemental_trend.trend_data,
                    'daily_patterns': daily_trend.trend_data
                },
                'top_activities': [
                    {'type': k, 'count': v, 'percentage': (v/total_events)*100}
                    for k, v in event_types.most_common(10)
                ] if total_events > 0 else [],
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting platform analytics: {e}")
            return {'error': str(e)}
    
    # Helper methods
    async def _get_user_insights(self, user_id: str) -> Optional[UserInsight]:
        """Get user insights from cache or database"""
        try:
            if user_id in self.insights_cache:
                return self.insights_cache[user_id]
            
            if self.cosmos_helper:
                container = self.cosmos_helper.get_container('user_insights')
                query = "SELECT * FROM c WHERE c.user_id = @user_id"
                items = list(container.query_items(
                    query=query,
                    parameters=[{"name": "@user_id", "value": user_id}]
                ))
                
                if items:
                    item = items[0]
                    insights = UserInsight(
                        user_id=item['user_id'],
                        engagement_score=item.get('engagement_score', 50.0),
                        active_hours=item.get('active_hours', []),
                        favorite_elements=item.get('favorite_elements', []),
                        cosmic_affinity=item.get('cosmic_affinity', {}),
                        predicted_interests=item.get('predicted_interests', []),
                        recommendation_tags=item.get('recommendation_tags', []),
                        last_updated=datetime.fromisoformat(item.get('last_updated', datetime.utcnow().isoformat()))
                    )
                    self.insights_cache[user_id] = insights
                    return insights
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting user insights: {e}")
            return None
    
    async def _store_user_insights(self, insights: UserInsight):
        """Store user insights to database"""
        try:
            if self.cosmos_helper:
                container = self.cosmos_helper.get_container('user_insights')
                insights_doc = {
                    'id': insights.user_id,
                    'user_id': insights.user_id,
                    'engagement_score': insights.engagement_score,
                    'active_hours': insights.active_hours,
                    'favorite_elements': insights.favorite_elements,
                    'cosmic_affinity': insights.cosmic_affinity,
                    'predicted_interests': insights.predicted_interests,
                    'recommendation_tags': insights.recommendation_tags,
                    'last_updated': insights.last_updated.isoformat()
                }
                
                container.upsert_item(body=insights_doc)
                
        except Exception as e:
            logger.error(f"Error storing user insights: {e}")
    
    async def _get_events_in_range(self, time_range: Tuple[datetime, datetime]) -> List[Dict[str, Any]]:
        """Get events within time range"""
        try:
            events = []
            
            # Get from cache first
            for event in self.engagement_cache:
                if time_range[0] <= event.timestamp <= time_range[1]:
                    events.append(asdict(event))
            
            # Get from database
            if self.cosmos_helper:
                container = self.cosmos_helper.get_container('analytics_events')
                query = """
                SELECT * FROM c 
                WHERE c.timestamp >= @start_time 
                AND c.timestamp <= @end_time
                """
                
                db_events = list(container.query_items(
                    query=query,
                    parameters=[
                        {"name": "@start_time", "value": time_range[0].isoformat()},
                        {"name": "@end_time", "value": time_range[1].isoformat()}
                    ]
                ))
                events.extend(db_events)
            
            return events
            
        except Exception as e:
            logger.error(f"Error getting events in range: {e}")
            return []
    
    async def _get_recent_events(self, user_id: str, days: int = 7) -> List[Dict[str, Any]]:
        """Get recent events for a user"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        events = await self._get_events_in_range((start_time, end_time))
        return [event for event in events if event.get('user_id') == user_id]
    
    async def _calculate_average_engagement(self, time_range: Tuple[datetime, datetime]) -> float:
        """Calculate average engagement score for time range"""
        try:
            if self.cosmos_helper:
                container = self.cosmos_helper.get_container('user_insights')
                query = "SELECT c.engagement_score FROM c"
                items = list(container.query_items(query=query))
                
                if items:
                    scores = [item['engagement_score'] for item in items]
                    return statistics.mean(scores)
            
            return 50.0
            
        except Exception as e:
            logger.error(f"Error calculating average engagement: {e}")
            return 50.0

# Initialize global analytics engine
analytics_engine = None

def get_analytics_engine(cosmos_helper=None):
    """Get or create analytics engine instance"""
    global analytics_engine
    if analytics_engine is None:
        analytics_engine = AnalyticsEngine(cosmos_helper)
    return analytics_engine

if __name__ == "__main__":
    # Test the analytics engine
    engine = AnalyticsEngine()
    print("Analytics Engine initialized successfully!")