#!/usr/bin/env python3
"""
Enhanced Analytics API Endpoints for STAR Platform
Real-time analytics dashboard, predictive insights, and cosmic pattern analysis
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from cosmos_db import get_cosmos_helper
from enhanced_analytics_engine import (AnalyticsAlert, EngagementEvent,
                                       EngagementType, PredictionType,
                                       get_enhanced_analytics_engine)
from flask import Blueprint, g, jsonify, request
from marshmallow import Schema, ValidationError, fields
from star_auth import token_required

logger = logging.getLogger(__name__)

# Create enhanced analytics blueprint
enhanced_analytics_bp = Blueprint('enhanced_analytics', __name__, url_prefix='/api/v1/analytics/enhanced')

# Constants
ANALYTICS_NOT_AVAILABLE = 'Enhanced analytics not available'
INSUFFICIENT_DATA = 'Insufficient data for analysis'

class AnalyticsRequestSchema(Schema):
    """Schema for analytics requests"""
    time_range = fields.Str(required=False, missing='24h')
    metric_types = fields.List(fields.Str(), required=False, missing=[])
    include_predictions = fields.Bool(required=False, missing=True)
    include_cosmic = fields.Bool(required=False, missing=True)

class UserInsightsRequestSchema(Schema):
    """Schema for user insights requests"""
    days = fields.Int(required=False, missing=30)
    include_predictions = fields.Bool(required=False, missing=True)
    include_recommendations = fields.Bool(required=False, missing=True)

@enhanced_analytics_bp.route('/dashboard', methods=['GET'])
@token_required
def get_real_time_dashboard():
    """Get real-time analytics dashboard data"""
    try:
        # Check if user has analytics permissions
        user_role = g.current_user.get('role', 'user')
        if user_role not in ['admin', 'moderator', 'analyst']:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Get enhanced analytics engine
        analytics_engine = get_enhanced_analytics_engine()
        if not analytics_engine:
            return jsonify({'error': ANALYTICS_NOT_AVAILABLE}), 503
        
        # Get dashboard data
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            dashboard_data = loop.run_until_complete(
                analytics_engine.get_real_time_dashboard_data()
            )
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'dashboard': dashboard_data,
            'last_updated': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get dashboard data: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@enhanced_analytics_bp.route('/user-insights', methods=['GET'])
@token_required
def get_user_insights():
    """Get personalized user insights and predictions"""
    try:
        # Validate request
        schema = UserInsightsRequestSchema()
        try:
            data = schema.load(request.args.to_dict())
        except ValidationError as e:
            return jsonify({'error': 'Invalid request', 'details': e.messages}), 400
        
        user_id = g.current_user['id']
        
        # Get enhanced analytics engine
        analytics_engine = get_enhanced_analytics_engine()
        if not analytics_engine:
            return jsonify({'error': ANALYTICS_NOT_AVAILABLE}), 503
        
        # Generate user insights report
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            insights_report = loop.run_until_complete(
                analytics_engine.generate_user_insights_report(
                    user_id, days=data['days']
                )
            )
        finally:
            loop.close()
        
        if 'error' in insights_report:
            return jsonify({'error': insights_report['error']}), 500
        
        # Filter sensitive data based on user permissions
        filtered_report = _filter_user_insights(insights_report, g.current_user)
        
        return jsonify({
            'success': True,
            'insights': filtered_report,
            'personalization_score': _calculate_personalization_score(filtered_report)
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get user insights: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@enhanced_analytics_bp.route('/predictions', methods=['GET'])
@token_required
def get_user_predictions():
    """Get personalized predictions for the user"""
    try:
        user_id = g.current_user['id']
        prediction_type = request.args.get('type', 'all')
        
        # Get enhanced analytics engine
        analytics_engine = get_enhanced_analytics_engine()
        if not analytics_engine:
            return jsonify({'error': ANALYTICS_NOT_AVAILABLE}), 503
        
        # Get user predictions from cache/database
        cosmos_helper = get_cosmos_helper()
        
        query = "SELECT * FROM c WHERE c.user_id = @user_id AND c.expires_at > @now"
        parameters = [
            {"name": "@user_id", "value": user_id},
            {"name": "@now", "value": datetime.now().isoformat()}
        ]
        
        if prediction_type != 'all':
            query += " AND c.prediction_type = @type"
            parameters.append({"name": "@type", "value": prediction_type})
        
        predictions = cosmos_helper.query_items(
            container_name='user_predictions',
            query=query,
            parameters=parameters
        )
        
        # Sort by confidence score
        predictions.sort(key=lambda x: x.get('confidence_score', 0), reverse=True)
        
        return jsonify({
            'success': True,
            'predictions': predictions[:10],  # Limit to top 10
            'available_types': [t.value for t in PredictionType],
            'generated_at': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get predictions: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@enhanced_analytics_bp.route('/cosmic-patterns', methods=['GET'])
@token_required
def get_cosmic_patterns():
    """Get cosmic pattern analysis and insights"""
    try:
        # Get enhanced analytics engine
        analytics_engine = get_enhanced_analytics_engine()
        if not analytics_engine:
            return jsonify({'error': ANALYTICS_NOT_AVAILABLE}), 503
        
        # Get cosmic patterns
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            cosmic_insights = loop.run_until_complete(
                analytics_engine._get_cosmic_pattern_insights()
            )
        finally:
            loop.close()
        
        # Get user's cosmic profile for personalization
        user_id = g.current_user['id']
        cosmos_helper = get_cosmos_helper()
        
        user_profile = cosmos_helper.query_items(
            container_name='profiles',
            query="SELECT * FROM c WHERE c.userId = @user_id",
            parameters=[{"name": "@user_id", "value": user_id}]
        )
        
        personalized_insights = cosmic_insights
        if user_profile:
            personalized_insights = _personalize_cosmic_insights(cosmic_insights, user_profile[0])
        
        return jsonify({
            'success': True,
            'cosmic_patterns': personalized_insights,
            'current_influences': await _get_current_cosmic_influences(),
            'recommendations': await _generate_cosmic_recommendations(user_profile[0] if user_profile else {})
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get cosmic patterns: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@enhanced_analytics_bp.route('/engagement-tracking', methods=['POST'])
@token_required
def track_enhanced_engagement():
    """Track enhanced engagement event with context"""
    try:
        data = request.get_json() or {}
        
        # Validate required fields
        if 'event_type' not in data:
            return jsonify({'error': 'event_type is required'}), 400
        
        try:
            event_type = EngagementType(data['event_type'])
        except ValueError:
            return jsonify({'error': 'Invalid event_type'}), 400
        
        user_id = g.current_user['id']
        
        # Create engagement event
        event = EngagementEvent(
            user_id=user_id,
            event_type=event_type,
            timestamp=datetime.now(),
            metadata=data.get('metadata', {}),
            session_id=data.get('session_id'),
            duration=data.get('duration'),
            zodiac_signs=data.get('zodiac_signs'),
            location=data.get('location')
        )
        
        # Get enhanced analytics engine
        analytics_engine = get_enhanced_analytics_engine()
        if not analytics_engine:
            return jsonify({'error': ANALYTICS_NOT_AVAILABLE}), 503
        
        # Track with enhanced context
        context = {
            'page_url': data.get('page_url'),
            'referrer': data.get('referrer'),
            'device_info': data.get('device_info'),
            'cosmic_context': data.get('cosmic_context')
        }
        
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            success = loop.run_until_complete(
                analytics_engine.track_enhanced_engagement(event, context)
            )
        finally:
            loop.close()
        
        if not success:
            return jsonify({'error': 'Failed to track engagement'}), 500
        
        return jsonify({
            'success': True,
            'event_id': f"{user_id}_{event.timestamp.isoformat()}_{event_type.value}",
            'tracked_at': datetime.now().isoformat()
        }), 201
        
    except Exception as e:
        logger.error(f"Failed to track enhanced engagement: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@enhanced_analytics_bp.route('/behavioral-analysis', methods=['GET'])
@token_required
def get_behavioral_analysis():
    """Get detailed behavioral analysis for the user"""
    try:
        user_id = g.current_user['id']
        days = int(request.args.get('days', 30))
        
        cosmos_helper = get_cosmos_helper()
        
        # Get user's engagement history
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        engagement_history = cosmos_helper.query_items(
            container_name='analytics_events',
            query="""
                SELECT * FROM c 
                WHERE c.user_id = @user_id 
                AND c.timestamp >= @start_date 
                AND c.timestamp <= @end_date
                ORDER BY c.timestamp DESC
            """,
            parameters=[
                {"name": "@user_id", "value": user_id},
                {"name": "@start_date", "value": start_date.isoformat()},
                {"name": "@end_date", "value": end_date.isoformat()}
            ]
        )
        
        if not engagement_history:
            return jsonify({
                'success': True,
                'analysis': {'message': INSUFFICIENT_DATA},
                'recommendations': ['Engage more with the platform to unlock behavioral insights!']
            }), 200
        
        # Analyze patterns
        analysis = _analyze_user_behavior(engagement_history)
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'time_period': f"{days} days",
            'data_points': len(engagement_history)
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get behavioral analysis: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@enhanced_analytics_bp.route('/recommendations', methods=['GET'])
@token_required
def get_personalized_recommendations():
    """Get AI-powered personalized recommendations"""
    try:
        user_id = g.current_user['id']
        context = request.args.get('context', 'general')  # 'general', 'cosmic', 'social', 'content'
        
        # Get enhanced analytics engine
        analytics_engine = get_enhanced_analytics_engine()
        if not analytics_engine:
            return jsonify({'error': ANALYTICS_NOT_AVAILABLE}), 503
        
        # Get user profile and insights
        cosmos_helper = get_cosmos_helper()
        
        user_profile = cosmos_helper.query_items(
            container_name='profiles',
            query="SELECT * FROM c WHERE c.userId = @user_id",
            parameters=[{"name": "@user_id", "value": user_id}]
        )
        
        if not user_profile:
            return jsonify({'error': 'User profile not found'}), 404
        
        # Generate context-specific recommendations
        recommendations = await _generate_contextual_recommendations(
            user_profile[0], context, analytics_engine
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'context': context,
            'generated_at': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Helper functions
def _filter_user_insights(insights: Dict[str, Any], user: Dict[str, Any]) -> Dict[str, Any]:
    """Filter sensitive insights based on user permissions"""
    # Remove sensitive data for regular users
    if user.get('role', 'user') == 'user':
        # Remove detailed behavioral patterns that might be too invasive
        if 'behavioral_patterns' in insights:
            insights['behavioral_patterns'] = {
                'summary': insights['behavioral_patterns'].get('summary', {}),
                'top_activities': insights['behavioral_patterns'].get('top_activities', [])
            }
    
    return insights

def _calculate_personalization_score(insights: Dict[str, Any]) -> float:
    """Calculate how personalized the insights are"""
    factors = []
    
    # Data richness
    if insights.get('engagement_summary', {}).get('total_events', 0) > 100:
        factors.append(0.3)
    elif insights.get('engagement_summary', {}).get('total_events', 0) > 10:
        factors.append(0.2)
    else:
        factors.append(0.1)
    
    # Prediction availability
    if len(insights.get('predictions', [])) > 5:
        factors.append(0.3)
    elif len(insights.get('predictions', [])) > 0:
        factors.append(0.2)
    else:
        factors.append(0.0)
    
    # Cosmic alignment data
    if insights.get('cosmic_alignment', {}).get('alignment_score', 0) > 0:
        factors.append(0.2)
    
    # Behavioral patterns
    if insights.get('behavioral_patterns', {}).get('pattern_count', 0) > 3:
        factors.append(0.2)
    
    return min(1.0, sum(factors))

def _analyze_user_behavior(engagement_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze user behavioral patterns"""
    # Time-based analysis
    hour_distribution = {}
    day_distribution = {}
    event_frequency = {}
    
    for event in engagement_history:
        timestamp = datetime.fromisoformat(event['timestamp'])
        hour = timestamp.hour
        day = timestamp.strftime('%A')
        event_type = event['event_type']
        
        hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
        day_distribution[day] = day_distribution.get(day, 0) + 1
        event_frequency[event_type] = event_frequency.get(event_type, 0) + 1
    
    # Find peak activity times
    peak_hour = max(hour_distribution.items(), key=lambda x: x[1])[0] if hour_distribution else 12
    peak_day = max(day_distribution.items(), key=lambda x: x[1])[0] if day_distribution else 'Monday'
    
    # Calculate engagement consistency
    daily_counts = list(day_distribution.values())
    consistency_score = 1.0 - (max(daily_counts) - min(daily_counts)) / max(daily_counts) if daily_counts else 0.5
    
    return {
        'peak_activity_hour': peak_hour,
        'peak_activity_day': peak_day,
        'most_common_activity': max(event_frequency.items(), key=lambda x: x[1])[0] if event_frequency else 'unknown',
        'consistency_score': consistency_score,
        'total_events': len(engagement_history),
        'unique_event_types': len(set(event['event_type'] for event in engagement_history)),
        'activity_distribution': {
            'hourly': hour_distribution,
            'daily': day_distribution,
            'by_type': event_frequency
        }
    }

def _personalize_cosmic_insights(cosmic_insights: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Personalize cosmic insights based on user's astrological profile"""
    personalized = cosmic_insights.copy()
    
    # Add user-specific cosmic alignment
    zodiac_signs = user_profile.get('zodiacSigns', {})
    if zodiac_signs:
        personalized['personal_alignment'] = {
            'western_sign_influence': zodiac_signs.get('western', 'unknown'),
            'chinese_sign_influence': zodiac_signs.get('chinese', 'unknown'),
            'numerology_resonance': user_profile.get('numerology', {}).get('lifePathNumber', 1)
        }
    
    return personalized

async def _get_current_cosmic_influences() -> Dict[str, Any]:
    """Get current cosmic influences"""
    # This would integrate with astronomical APIs
    return {
        'lunar_phase': 'waxing_crescent',
        'dominant_element': 'fire',
        'planetary_hour': 'venus',
        'cosmic_weather': 'clear'
    }

async def _generate_cosmic_recommendations(user_profile: Dict[str, Any]) -> List[str]:
    """Generate cosmic-based recommendations"""
    recommendations = []
    
    # Based on lunar phase
    recommendations.append("This waxing crescent moon is perfect for setting new intentions")
    
    # Based on user's zodiac
    zodiac_sign = user_profile.get('zodiacSigns', {}).get('western', '').lower()
    if zodiac_sign == 'aries':
        recommendations.append("Your fiery Aries energy is amplified today - perfect for new projects!")
    elif zodiac_sign == 'cancer':
        recommendations.append("Trust your Cancerian intuition - it's especially strong right now")
    
    return recommendations

async def _generate_contextual_recommendations(user_profile: Dict[str, Any], 
                                             context: str, 
                                             analytics_engine) -> List[Dict[str, Any]]:
    """Generate context-specific recommendations"""
    recommendations = []
    
    if context == 'cosmic':
        recommendations.extend([
            {
                'type': 'cosmic_timing',
                'title': 'Optimal Time for Tarot Reading',
                'description': 'The next 2 hours are cosmically aligned for divination',
                'action': 'Start a tarot reading session',
                'confidence': 0.8
            },
            {
                'type': 'lunar_alignment',
                'title': 'Lunar Phase Activity',
                'description': 'Current moon phase supports introspective activities',
                'action': 'Try meditation or journaling',
                'confidence': 0.7
            }
        ])
    
    elif context == 'social':
        recommendations.extend([
            {
                'type': 'community_engagement',
                'title': 'Join a Cosmic Chat',
                'description': 'Users with similar astrological profiles are active now',
                'action': 'Join collaborative cosmos session',
                'confidence': 0.6
            }
        ])
    
    elif context == 'content':
        recommendations.extend([
            {
                'type': 'content_creation',
                'title': 'Share Your Cosmic Journey',
                'description': 'Your engagement suggests others would value your insights',
                'action': 'Create a reflective post about your recent experiences',
                'confidence': 0.7
            }
        ])
    
    return recommendations