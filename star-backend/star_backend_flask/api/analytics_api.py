"""
STAR Platform Analytics API
=========================

REST API endpoints for analytics and insights functionality.
Provides user engagement tracking, cosmic pattern analysis, and personalized recommendations.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from analytics_engine import (CosmicPattern, EngagementEvent, EngagementType,
                              get_analytics_engine)
from flask import Blueprint, g, jsonify, request
from star_auth import token_required

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/track', methods=['POST'])
@token_required
def track_engagement():
    """
    Track user engagement event
    
    Expected payload:
    {
        "event_type": "post_like",
        "metadata": {
            "post_id": "123",
            "target_user": "456"
        },
        "session_id": "session_789",
        "duration": 45.5,
        "location": {
            "page": "cosmic_feed",
            "section": "main_feed"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'event_type' not in data:
            return jsonify({'error': 'event_type is required'}), 400
        
        # Validate event type
        try:
            event_type = EngagementType(data['event_type'])
        except ValueError:
            return jsonify({'error': f'Invalid event_type: {data["event_type"]}'}), 400
        
        # Get user info
        user_id = g.current_user['id']
        
        # Get user's zodiac signs if available
        zodiac_signs = None
        if hasattr(g, 'user_profile') and g.user_profile:
            zodiac_signs = g.user_profile.get('zodiac_signs')
        
        # Create engagement event
        event = EngagementEvent(
            user_id=user_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            metadata=data.get('metadata', {}),
            session_id=data.get('session_id'),
            duration=data.get('duration'),
            zodiac_signs=zodiac_signs,
            location=data.get('location')
        )
        
        # Track the event
        engine = get_analytics_engine()
        success = asyncio.run(engine.track_engagement(event))
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Engagement tracked successfully',
                'timestamp': event.timestamp.isoformat()
            })
        else:
            return jsonify({'error': 'Failed to track engagement'}), 500
            
    except Exception as e:
        logger.error(f"Error in track_engagement: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/insights/<user_id>', methods=['GET'])
@token_required
def get_user_insights(user_id: str):
    """
    Get user insights and analytics
    Only users can access their own insights (or admins)
    """
    try:
        # Authorization check
        if g.current_user['id'] != user_id and not g.current_user.get('is_admin', False):
            return jsonify({'error': 'Unauthorized to access these insights'}), 403
        
        engine = get_analytics_engine()
        insights = asyncio.run(engine._get_user_insights(user_id))
        
        if not insights:
            return jsonify({
                'user_id': user_id,
                'insights': None,
                'message': 'No insights available yet. Start engaging to build your profile!'
            })
        
        return jsonify({
            'user_id': user_id,
            'insights': {
                'engagement_score': insights.engagement_score,
                'active_hours': insights.active_hours,
                'favorite_elements': insights.favorite_elements,
                'cosmic_affinity': insights.cosmic_affinity,
                'predicted_interests': insights.predicted_interests,
                'recommendation_tags': insights.recommendation_tags,
                'last_updated': insights.last_updated.isoformat()
            },
            'generated_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in get_user_insights: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/recommendations', methods=['GET'])
@token_required
def get_recommendations():
    """
    Get personalized recommendations for current user
    
    Query params:
    - type: 'general', 'content', 'social', 'cosmic' (default: 'general')
    """
    try:
        user_id = g.current_user['id']
        recommendation_type = request.args.get('type', 'general')
        
        # Validate recommendation type
        valid_types = ['general', 'content', 'social', 'cosmic']
        if recommendation_type not in valid_types:
            return jsonify({'error': f'Invalid recommendation type. Must be one of: {valid_types}'}), 400
        
        engine = get_analytics_engine()
        recommendations = asyncio.run(engine.get_user_recommendations(user_id, recommendation_type))
        
        return jsonify(recommendations)
        
    except Exception as e:
        logger.error(f"Error in get_recommendations: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/cosmic-patterns', methods=['GET'])
@token_required
def get_cosmic_patterns():
    """
    Get cosmic pattern analysis
    
    Query params:
    - pattern: 'elemental_affinity', 'zodiac_compatibility', 'lunar_cycle_activity', 
              'seasonal_trends', 'time_of_day_patterns', 'tarot_card_frequency' 
              (default: 'elemental_affinity')
    - days: number of days to analyze (default: 30)
    """
    try:
        pattern_name = request.args.get('pattern', 'elemental_affinity')
        days = int(request.args.get('days', 30))
        
        # Validate pattern type
        try:
            pattern_type = CosmicPattern(pattern_name)
        except ValueError:
            valid_patterns = [p.value for p in CosmicPattern]
            return jsonify({'error': f'Invalid pattern type. Must be one of: {valid_patterns}'}), 400
        
        # Calculate time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        engine = get_analytics_engine()
        trend = asyncio.run(engine.analyze_cosmic_patterns(pattern_type, (start_time, end_time)))
        
        return jsonify({
            'pattern_type': trend.pattern_type.value,
            'trend_data': trend.trend_data,
            'confidence_score': trend.confidence_score,
            'time_range': {
                'start': trend.time_range[0].isoformat(),
                'end': trend.time_range[1].isoformat(),
                'days': days
            },
            'affected_users': trend.affected_users,
            'correlation_factors': trend.correlation_factors,
            'generated_at': datetime.utcnow().isoformat()
        })
        
    except ValueError as ve:
        return jsonify({'error': f'Invalid days parameter: {ve}'}), 400
    except Exception as e:
        logger.error(f"Error in get_cosmic_patterns: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/platform-analytics', methods=['GET'])
@token_required
def get_platform_analytics():
    """
    Get comprehensive platform analytics
    Requires admin privileges
    
    Query params:
    - days: number of days to analyze (default: 7)
    """
    try:
        # Check admin privileges
        if not g.current_user.get('is_admin', False):
            return jsonify({'error': 'Admin privileges required'}), 403
        
        days = int(request.args.get('days', 7))
        
        # Calculate time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        engine = get_analytics_engine()
        analytics = asyncio.run(engine.get_platform_analytics((start_time, end_time)))
        
        return jsonify(analytics)
        
    except ValueError as ve:
        return jsonify({'error': f'Invalid days parameter: {ve}'}), 400
    except Exception as e:
        logger.error(f"Error in get_platform_analytics: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/engagement-summary', methods=['GET'])
@token_required
def get_engagement_summary():
    """
    Get user's engagement summary for dashboard
    """
    try:
        user_id = g.current_user['id']
        days = int(request.args.get('days', 7))
        
        engine = get_analytics_engine()
        
        # Get user insights
        insights = asyncio.run(engine._get_user_insights(user_id))
        
        # Get recent events for activity calculation
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        recent_events = asyncio.run(engine._get_recent_events(user_id, days))
        
        # Calculate activity metrics
        total_activities = len(recent_events)
        daily_average = total_activities / max(1, days)
        
        # Most common activities
        from collections import Counter
        activity_counts = Counter(event.get('event_type', 'unknown') for event in recent_events)
        top_activities = [
            {'type': activity, 'count': count}
            for activity, count in activity_counts.most_common(5)
        ]
        
        # Engagement trend (simplified)
        engagement_trend = "stable"
        if insights and insights.engagement_score > 80:
            engagement_trend = "high"
        elif insights and insights.engagement_score < 40:
            engagement_trend = "low"
        
        return jsonify({
            'user_id': user_id,
            'time_period': {
                'days': days,
                'start': start_time.isoformat(),
                'end': end_time.isoformat()
            },
            'engagement_summary': {
                'total_activities': total_activities,
                'daily_average': round(daily_average, 1),
                'engagement_score': insights.engagement_score if insights else 50.0,
                'engagement_trend': engagement_trend,
                'top_activities': top_activities,
                'favorite_elements': insights.favorite_elements[:3] if insights else [],
                'active_hours': insights.active_hours[:5] if insights else []
            },
            'recommendations_count': len(asyncio.run(engine.get_user_recommendations(user_id))['recommendations']),
            'generated_at': datetime.utcnow().isoformat()
        })
        
    except ValueError as ve:
        return jsonify({'error': f'Invalid days parameter: {ve}'}), 400
    except Exception as e:
        logger.error(f"Error in get_engagement_summary: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/batch-track', methods=['POST'])
@token_required
def batch_track_engagement():
    """
    Track multiple engagement events in batch
    
    Expected payload:
    {
        "events": [
            {
                "event_type": "post_view",
                "metadata": {"post_id": "123"},
                "timestamp": "2024-01-01T12:00:00Z" (optional)
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'events' not in data or not isinstance(data['events'], list):
            return jsonify({'error': 'events array is required'}), 400
        
        user_id = g.current_user['id']
        engine = get_analytics_engine()
        
        successful_tracks = 0
        failed_tracks = 0
        errors = []
        
        # Get user's zodiac signs if available
        zodiac_signs = None
        if hasattr(g, 'user_profile') and g.user_profile:
            zodiac_signs = g.user_profile.get('zodiac_signs')
        
        for i, event_data in enumerate(data['events']):
            try:
                # Validate event type
                if 'event_type' not in event_data:
                    errors.append(f"Event {i}: event_type is required")
                    failed_tracks += 1
                    continue
                
                try:
                    event_type = EngagementType(event_data['event_type'])
                except ValueError:
                    errors.append(f"Event {i}: Invalid event_type: {event_data['event_type']}")
                    failed_tracks += 1
                    continue
                
                # Parse timestamp if provided
                timestamp = datetime.utcnow()
                if 'timestamp' in event_data:
                    try:
                        timestamp = datetime.fromisoformat(event_data['timestamp'].replace('Z', '+00:00'))
                    except ValueError:
                        errors.append(f"Event {i}: Invalid timestamp format")
                        failed_tracks += 1
                        continue
                
                # Create engagement event
                event = EngagementEvent(
                    user_id=user_id,
                    event_type=event_type,
                    timestamp=timestamp,
                    metadata=event_data.get('metadata', {}),
                    session_id=event_data.get('session_id'),
                    duration=event_data.get('duration'),
                    zodiac_signs=zodiac_signs,
                    location=event_data.get('location')
                )
                
                # Track the event
                success = asyncio.run(engine.track_engagement(event))
                
                if success:
                    successful_tracks += 1
                else:
                    failed_tracks += 1
                    errors.append(f"Event {i}: Failed to track engagement")
                    
            except Exception as e:
                failed_tracks += 1
                errors.append(f"Event {i}: {str(e)}")
        
        return jsonify({
            'success': successful_tracks > 0,
            'summary': {
                'total_events': len(data['events']),
                'successful': successful_tracks,
                'failed': failed_tracks,
                'success_rate': (successful_tracks / len(data['events'])) * 100 if data['events'] else 0
            },
            'errors': errors[:10],  # Limit error messages
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in batch_track_engagement: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_engagement_leaderboard():
    """
    Get engagement leaderboard (anonymized)
    
    Query params:
    - period: 'daily', 'weekly', 'monthly' (default: 'weekly')
    - limit: number of users to return (default: 10, max: 50)
    """
    try:
        period = request.args.get('period', 'weekly')
        limit = min(int(request.args.get('limit', 10)), 50)
        
        # Calculate time range based on period
        end_time = datetime.utcnow()
        if period == 'daily':
            start_time = end_time - timedelta(days=1)
        elif period == 'weekly':
            start_time = end_time - timedelta(days=7)
        elif period == 'monthly':
            start_time = end_time - timedelta(days=30)
        else:
            return jsonify({'error': 'Invalid period. Must be daily, weekly, or monthly'}), 400
        
        engine = get_analytics_engine()
        
        # Get events in time range
        events = asyncio.run(engine._get_events_in_range((start_time, end_time)))
        
        # Count activities per user
        user_activity = {}
        for event in events:
            user_id = event.get('user_id')
            if user_id:
                user_activity[user_id] = user_activity.get(user_id, 0) + 1
        
        # Sort and anonymize
        sorted_users = sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        leaderboard = []
        for rank, (user_id, activity_count) in enumerate(sorted_users, 1):
            # Anonymize user ID (keep first 3 chars + stars)
            anonymous_id = user_id[:3] + '*' * (len(user_id) - 3) if len(user_id) > 3 else '***'
            
            leaderboard.append({
                'rank': rank,
                'user_id': anonymous_id,
                'activity_count': activity_count,
                'is_current_user': user_id == g.current_user['id']
            })
        
        return jsonify({
            'leaderboard': leaderboard,
            'period': period,
            'time_range': {
                'start': start_time.isoformat(),
                'end': end_time.isoformat()
            },
            'total_participants': len(user_activity),
            'your_rank': None,  # Will be set if user is in leaderboard
            'generated_at': datetime.utcnow().isoformat()
        })
        
    except ValueError as ve:
        return jsonify({'error': f'Invalid limit parameter: {ve}'}), 400
    except Exception as e:
        logger.error(f"Error in get_engagement_leaderboard: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Health check endpoint for analytics
@analytics_bp.route('/health', methods=['GET'])
def analytics_health():
    """Health check for analytics system"""
    try:
        engine = get_analytics_engine()
        
        # Basic health indicators
        cache_size = len(engine.engagement_cache)
        insights_cached = len(engine.insights_cache)
        
        return jsonify({
            'status': 'healthy',
            'analytics_engine': 'operational',
            'cache_stats': {
                'engagement_events_cached': cache_size,
                'user_insights_cached': insights_cached
            },
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Analytics health check failed: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

if __name__ == "__main__":
    print("Analytics API blueprint created successfully!")