# Enhanced Tarot API Endpoints
# Integrates with enhanced_tarot_engine.py for advanced spreads, AI interpretations, and cosmic timing

import logging
import uuid
from datetime import datetime, timedelta, timezone

from cosmos_db import get_cosmos_helper
from enhanced_tarot_engine import AdvancedTarotSpread, EnhancedTarotEngine
from flask import Blueprint, g, jsonify, request
from numerology import NumerologyEngine
from star_auth import token_required

# Constants to avoid duplication
READING_NOT_FOUND_ERROR = 'Reading not found or access denied'
USER_ID_PARAM = "@user_id"

# Initialize engines
enhanced_tarot_engine = EnhancedTarotEngine()
numerology_engine = NumerologyEngine()

# Create blueprint for enhanced tarot endpoints
enhanced_tarot_bp = Blueprint('enhanced_tarot_bp', __name__)

@enhanced_tarot_bp.route('/api/v1/tarot/enhanced-spreads', methods=['GET'])
@token_required
def get_available_spreads(current_user):
    """Get all available enhanced tarot spreads"""
    try:
        spreads = enhanced_tarot_engine.get_available_spreads()
        
        # Add cosmic timing recommendations for each spread
        cosmic_recommendations = {}
        for spread_name in spreads.keys():
            cosmic_recommendations[spread_name] = enhanced_tarot_engine.get_cosmic_timing_advice(
                current_user.get('zodiac_sign', 'Scorpio'),
                spread_name
            )
        
        return jsonify({
            'success': True,
            'spreads': spreads,
            'cosmic_timing': cosmic_recommendations,
            'user_zodiac': current_user.get('zodiac_sign', 'Scorpio')
        })
        
    except Exception as e:
        logging.error(f"Enhanced spreads error: {e}")
        return jsonify({'error': 'Failed to load available spreads'}), 500


@enhanced_tarot_bp.route('/api/v1/tarot/enhanced-draw', methods=['POST'])
@token_required
def enhanced_tarot_draw(current_user):
    """Perform enhanced tarot reading with AI interpretations and cosmic integration"""
    try:
        data = request.get_json()
        spread_type = data.get('spread_type', 'celtic_cross')
        question = data.get('question', '').strip()
        zodiac_context = data.get('zodiac_context', {})
        
        user_id = current_user['id']
        user_zodiac = current_user.get('zodiac_sign', 'Scorpio')
        
        # Validate spread type
        available_spreads = enhanced_tarot_engine.get_available_spreads()
        if spread_type not in available_spreads:
            return jsonify({'error': f'Invalid spread type: {spread_type}'}), 400
        
        # Get user's numerology data for enhanced interpretation
        cosmos_helper = get_cosmos_helper()
        try:
            profiles_container = cosmos_helper.get_container('profiles')
            profile = profiles_container.read_item(item=user_id, partition_key=user_id)
            numerology_data = profile.get('numerology', {})
        except Exception:
            # Generate basic numerology if not available
            birth_date = current_user.get('birth_date', '1990-10-31')
            numerology_data = numerology_engine.calculate_comprehensive_profile(birth_date)
        
        # Create spread instance
        spread = AdvancedTarotSpread(spread_type)
        
        # Draw cards for the spread
        cards = enhanced_tarot_engine.draw_cards_for_spread(spread)
        
        # Generate AI interpretation with full context
        interpretation_context = {
            'user_zodiac': user_zodiac,
            'numerology': numerology_data,
            'zodiac_context': zodiac_context,
            'question': question,
            'cosmic_influences': enhanced_tarot_engine.calculate_cosmic_influences(user_zodiac)
        }
        
        ai_interpretation = enhanced_tarot_engine.generate_ai_interpretation(
            cards, spread, interpretation_context
        )
        
        # Get cosmic timing advice
        cosmic_timing = enhanced_tarot_engine.get_cosmic_timing_advice(user_zodiac, spread_type)
        
        # Calculate energy flow between cards
        energy_flow = enhanced_tarot_engine.calculate_energy_flow_advanced(cards, spread)
        
        # Generate personalized guidance based on numerology
        numerology_guidance = enhanced_tarot_engine.generate_numerology_guidance(
            cards, numerology_data
        )
        
        # Create comprehensive reading record
        reading_id = str(uuid.uuid4())
        reading_record = {
            'id': reading_id,
            'user_id': user_id,
            'spread_type': spread_type,
            'question': question,
            'user_zodiac': user_zodiac,
            'cards': [card.to_dict() for card in cards],
            'spread_positions': spread.positions,
            'ai_interpretation': ai_interpretation,
            'cosmic_timing': cosmic_timing,
            'energy_flow': energy_flow,
            'numerology_guidance': numerology_guidance,
            'interpretation_context': interpretation_context,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'reading_type': 'enhanced_spread'
        }
        
        # Store reading in Cosmos DB
        try:
            tarot_container = cosmos_helper.get_container('tarot_readings')
            tarot_container.create_item(reading_record)
        except Exception as e:
            logging.warning(f"Failed to store reading in Cosmos DB: {e}")
        
        # Generate follow-up recommendations
        follow_up_recommendations = enhanced_tarot_engine.generate_follow_up_recommendations(
            cards, spread, user_zodiac, numerology_data
        )
        
        return jsonify({
            'success': True,
            'reading_id': reading_id,
            'spread_type': spread_type,
            'spread_name': spread.name,
            'spread_description': spread.description,
            'cards': [card.to_dict() for card in cards],
            'positions': spread.positions,
            'ai_interpretation': ai_interpretation,
            'cosmic_timing': cosmic_timing,
            'energy_flow': energy_flow,
            'numerology_guidance': numerology_guidance,
            'follow_up_recommendations': follow_up_recommendations,
            'cosmic_influences': interpretation_context['cosmic_influences'],
            'created_at': reading_record['created_at']
        })
        
    except Exception as e:
        logging.error(f"Enhanced tarot draw error: {e}")
        return jsonify({'error': 'Failed to perform enhanced tarot reading'}), 500


@enhanced_tarot_bp.route('/api/v1/tarot/readings/<reading_id>', methods=['GET'])
@token_required
def get_tarot_reading(current_user, reading_id):
    """Retrieve a specific tarot reading by ID"""
    try:
        user_id = current_user['id']
        cosmos_helper = get_cosmos_helper()
        
        # Get reading from Cosmos DB
        tarot_container = cosmos_helper.get_container('tarot_readings')
        try:
            reading = tarot_container.read_item(item=reading_id, partition_key=user_id)
        except Exception:
            return jsonify({'error': READING_NOT_FOUND_ERROR}), 404
        
        # Verify ownership
        if reading.get('user_id') != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Add any real-time cosmic updates if the reading is recent
        if reading.get('created_at'):
            reading_time = datetime.fromisoformat(reading['created_at'].replace('Z', '+00:00'))
            if (datetime.now(timezone.utc) - reading_time).total_seconds() < 3600:  # Within 1 hour
                reading['cosmic_updates'] = enhanced_tarot_engine.get_real_time_cosmic_updates(
                    reading.get('user_zodiac', 'Scorpio')
                )
        
        return jsonify({
            'success': True,
            'reading': reading
        })
        
    except Exception as e:
        logging.error(f"Get tarot reading error: {e}")
        return jsonify({'error': 'Failed to retrieve reading'}), 500


@enhanced_tarot_bp.route('/api/v1/tarot/readings', methods=['GET'])
@token_required
def get_user_tarot_readings(current_user):
    """Get all tarot readings for the authenticated user"""
    try:
        user_id = current_user['id']
        limit = min(int(request.args.get('limit', 20)), 50)
        offset = int(request.args.get('offset', 0))
        
        cosmos_helper = get_cosmos_helper()
        tarot_container = cosmos_helper.get_container('tarot_readings')
        
        # Query user's readings
        query = """
        SELECT * FROM c 
        WHERE c.user_id = @user_id 
        ORDER BY c.created_at DESC
        OFFSET @offset LIMIT @limit
        """
        
        readings = list(tarot_container.query_items(
            query=query,
            parameters=[
                {"name": USER_ID_PARAM, "value": user_id},
                {"name": "@offset", "value": offset},
                {"name": "@limit", "value": limit}
            ],
            enable_cross_partition_query=True
        ))
        
        # Add summary information for each reading
        for reading in readings:
            reading['summary'] = {
                'spread_type': reading.get('spread_type'),
                'card_count': len(reading.get('cards', [])),
                'question_preview': reading.get('question', '')[:100] + ('...' if len(reading.get('question', '')) > 100 else ''),
                'cosmic_energy': enhanced_tarot_engine.calculate_reading_cosmic_energy(reading.get('cards', []))
            }
        
        return jsonify({
            'success': True,
            'readings': readings,
            'total': len(readings),
            'has_more': len(readings) == limit
        })
        
    except Exception as e:
        logging.error(f"Get user readings error: {e}")
        return jsonify({'error': 'Failed to retrieve readings'}), 500


@enhanced_tarot_bp.route('/api/v1/tarot/card-meanings', methods=['GET'])
@token_required
def get_card_meanings(current_user):
    """Get comprehensive card meanings with zodiac-specific interpretations"""
    try:
        card_name = request.args.get('card_name')
        user_zodiac = current_user.get('zodiac_sign', 'Scorpio')
        
        if not card_name:
            return jsonify({'error': 'Card name parameter required'}), 400
        
        # Get card from the engine
        card = enhanced_tarot_engine.get_card_by_name(card_name)
        if not card:
            return jsonify({'error': f'Card not found: {card_name}'}), 404
        
        # Generate zodiac-specific interpretation
        zodiac_interpretation = enhanced_tarot_engine.generate_zodiac_specific_interpretation(
            card, user_zodiac
        )
        
        # Get elemental correspondences
        elemental_info = enhanced_tarot_engine.get_elemental_correspondences(card)
        
        # Generate timing information
        timing_info = enhanced_tarot_engine.get_card_timing_information(card, user_zodiac)
        
        return jsonify({
            'success': True,
            'card': card.to_dict(),
            'zodiac_interpretation': zodiac_interpretation,
            'elemental_correspondences': elemental_info,
            'timing_information': timing_info,
            'user_zodiac': user_zodiac
        })
        
    except Exception as e:
        logging.error(f"Get card meanings error: {e}")
        return jsonify({'error': 'Failed to get card meanings'}), 500


@enhanced_tarot_bp.route('/api/v1/tarot/cosmic-influences', methods=['GET'])
@token_required
def get_cosmic_influences(current_user):
    """Get current cosmic influences affecting tarot readings"""
    try:
        user_zodiac = current_user.get('zodiac_sign', 'Scorpio')
        
        # Get comprehensive cosmic influences
        cosmic_influences = enhanced_tarot_engine.calculate_cosmic_influences(user_zodiac)
        
        # Get planetary transits affecting readings
        planetary_influences = enhanced_tarot_engine.get_planetary_influences_for_tarot()
        
        # Get recommended reading times
        optimal_times = enhanced_tarot_engine.get_optimal_reading_times(user_zodiac)
        
        # Get moon phase information
        moon_phase_info = enhanced_tarot_engine.get_moon_phase_tarot_influence()
        
        return jsonify({
            'success': True,
            'cosmic_influences': cosmic_influences,
            'planetary_influences': planetary_influences,
            'optimal_reading_times': optimal_times,
            'moon_phase': moon_phase_info,
            'user_zodiac': user_zodiac,
            'generated_at': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logging.error(f"Get cosmic influences error: {e}")
        return jsonify({'error': 'Failed to get cosmic influences'}), 500


@enhanced_tarot_bp.route('/api/v1/tarot/daily-guidance', methods=['GET'])
@token_required
def get_daily_tarot_guidance(current_user):
    """Get daily tarot guidance with single card draw and cosmic context"""
    try:
        user_id = current_user['id']
        user_zodiac = current_user.get('zodiac_sign', 'Scorpio')
        today = datetime.now(timezone.utc).date()
        
        # Check if user already has daily guidance for today
        cosmos_helper = get_cosmos_helper()
        tarot_container = cosmos_helper.get_container('tarot_readings')
        
        query = """
        SELECT * FROM c 
        WHERE c.user_id = @user_id 
        AND c.reading_type = 'daily_guidance'
        AND c.date = @today
        """
        
        existing_readings = list(tarot_container.query_items(
            query=query,
            parameters=[
                {"name": USER_ID_PARAM, "value": user_id},
                {"name": "@today", "value": today.isoformat()}
            ],
            enable_cross_partition_query=True
        ))
        
        if existing_readings:
            return jsonify({
                'success': True,
                'daily_guidance': existing_readings[0],
                'is_cached': True
            })
        
        # Draw daily card
        daily_card = enhanced_tarot_engine.draw_single_card()
        
        # Generate daily interpretation with numerology
        try:
            profiles_container = cosmos_helper.get_container('profiles')
            profile = profiles_container.read_item(item=user_id, partition_key=user_id)
            numerology_data = profile.get('numerology', {})
        except Exception:
            birth_date = current_user.get('birth_date', '1990-10-31')
            numerology_data = numerology_engine.calculate_comprehensive_profile(birth_date)
        
        daily_interpretation = enhanced_tarot_engine.generate_daily_interpretation(
            daily_card, user_zodiac, numerology_data
        )
        
        # Get cosmic context for today
        cosmic_context = enhanced_tarot_engine.get_daily_cosmic_context(user_zodiac)
        
        # Create daily guidance record
        guidance_id = str(uuid.uuid4())
        daily_guidance = {
            'id': guidance_id,
            'user_id': user_id,
            'date': today.isoformat(),
            'card': daily_card.to_dict(),
            'interpretation': daily_interpretation,
            'cosmic_context': cosmic_context,
            'user_zodiac': user_zodiac,
            'numerology_influence': numerology_data.get('personal_year_influence', ''),
            'created_at': datetime.now(timezone.utc).isoformat(),
            'reading_type': 'daily_guidance'
        }
        
        # Store in Cosmos DB
        try:
            tarot_container.create_item(daily_guidance)
        except Exception as e:
            logging.warning(f"Failed to store daily guidance: {e}")
        
        return jsonify({
            'success': True,
            'daily_guidance': daily_guidance,
            'is_cached': False
        })
        
    except Exception as e:
        logging.error(f"Daily guidance error: {e}")
        return jsonify({'error': 'Failed to get daily guidance'}), 500


@enhanced_tarot_bp.route('/api/v1/tarot/share-reading', methods=['POST'])
@token_required
def share_tarot_reading(current_user):
    """Share a tarot reading to social feed or profile"""
    try:
        data = request.get_json()
        reading_id = data.get('reading_id')
        share_type = data.get('share_type', 'feed')  # 'feed' or 'profile'
        sharing_message = data.get('message', '').strip()
        
        if not reading_id:
            return jsonify({'error': 'Reading ID required'}), 400
        
        user_id = current_user['id']
        cosmos_helper = get_cosmos_helper()
        
        # Verify reading ownership
        tarot_container = cosmos_helper.get_container('tarot_readings')
        try:
            reading = tarot_container.read_item(item=reading_id, partition_key=user_id)
        except Exception:
            return jsonify({'error': READING_NOT_FOUND_ERROR}), 404
        
        # Create shared reading post
        shared_post_id = str(uuid.uuid4())
        shared_post = {
            'id': shared_post_id,
            'user_id': user_id,
            'username': current_user.get('username', 'Cosmic Traveler'),
            'zodiac': current_user.get('zodiac_sign', 'Scorpio'),
            'type': 'shared_tarot_reading',
            'share_type': share_type,
            'original_reading_id': reading_id,
            'sharing_message': sharing_message,
            'content': {
                'spread_type': reading.get('spread_type'),
                'key_card': reading.get('cards', [{}])[0] if reading.get('cards') else {},
                'preview_interpretation': reading.get('ai_interpretation', {}).get('summary', '')[:200] + '...'
            },
            'privacy_level': 'public',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Store shared post based on type
        if share_type == 'feed':
            # Add to posts container for social feed
            posts_container = cosmos_helper.get_container('posts')
            posts_container.create_item(shared_post)
        elif share_type == 'profile':
            # Add to user's profile shared readings
            try:
                profiles_container = cosmos_helper.get_container('profiles')
                profile = profiles_container.read_item(item=user_id, partition_key=user_id)
                
                if 'shared_readings' not in profile:
                    profile['shared_readings'] = []
                
                profile['shared_readings'].insert(0, shared_post)  # Add to beginning
                profile['shared_readings'] = profile['shared_readings'][:10]  # Keep last 10
                
                profiles_container.upsert_item(profile)
            except Exception as e:
                logging.warning(f"Failed to add to profile: {e}")
        
        return jsonify({
            'success': True,
            'shared_post_id': shared_post_id,
            'message': f'Reading shared to {share_type} successfully',
            'share_type': share_type
        })
        
    except Exception as e:
        logging.error(f"Share reading error: {e}")
        return jsonify({'error': 'Failed to share reading'}), 500


@enhanced_tarot_bp.route('/api/v1/tarot/reflection', methods=['POST'])
@token_required
def add_reading_reflection(current_user):
    """Add personal reflection to a tarot reading"""
    try:
        data = request.get_json()
        reading_id = data.get('reading_id')
        reflection_text = data.get('reflection', '').strip()
        reflection_tags = data.get('tags', [])
        
        if not reading_id or not reflection_text:
            return jsonify({'error': 'Reading ID and reflection text required'}), 400
        
        user_id = current_user['id']
        cosmos_helper = get_cosmos_helper()
        
        # Verify reading ownership and update
        tarot_container = cosmos_helper.get_container('tarot_readings')
        try:
            reading = tarot_container.read_item(item=reading_id, partition_key=user_id)
        except Exception:
            return jsonify({'error': READING_NOT_FOUND_ERROR}), 404
        
        # Add reflection to reading
        reflection_data = {
            'id': str(uuid.uuid4()),
            'text': reflection_text,
            'tags': reflection_tags,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        if 'reflections' not in reading:
            reading['reflections'] = []
        
        reading['reflections'].append(reflection_data)
        
        # Update reading in Cosmos DB
        tarot_container.upsert_item(reading)
        
        return jsonify({
            'success': True,
            'reflection_id': reflection_data['id'],
            'message': 'Reflection added successfully'
        })
        
    except Exception as e:
        logging.error(f"Add reflection error: {e}")
        return jsonify({'error': 'Failed to add reflection'}), 500


@enhanced_tarot_bp.route('/api/v1/tarot/statistics', methods=['GET'])
@token_required
def get_tarot_statistics(current_user):
    """Get user's tarot reading statistics and insights"""
    try:
        user_id = current_user['id']
        cosmos_helper = get_cosmos_helper()
        
        # Query all user readings
        tarot_container = cosmos_helper.get_container('tarot_readings')
        query = "SELECT * FROM c WHERE c.user_id = @user_id"
        
        all_readings = list(tarot_container.query_items(
            query=query,
            parameters=[{"name": USER_ID_PARAM, "value": user_id}],
            enable_cross_partition_query=True
        ))
        
        if not all_readings:
            return jsonify({
                'success': True,
                'statistics': {
                    'total_readings': 0,
                    'message': 'No readings found. Start your tarot journey!'
                }
            })
        
        # Calculate comprehensive statistics
        statistics = enhanced_tarot_engine.calculate_user_tarot_statistics(all_readings)
        
        return jsonify({
            'success': True,
            'statistics': statistics
        })
        
    except Exception as e:
        logging.error(f"Get statistics error: {e}")
        return jsonify({'error': 'Failed to get tarot statistics'}), 500


# Health check endpoint for enhanced tarot system
@enhanced_tarot_bp.route('/api/v1/tarot/health', methods=['GET'])
def tarot_health_check():
    """Health check for enhanced tarot system"""
    try:
        # Test engine initialization
        test_card = enhanced_tarot_engine.draw_single_card()
        
        return jsonify({
            'status': 'healthy',
            'engine_loaded': True,
            'total_cards': len(enhanced_tarot_engine.tarot_deck),
            'available_spreads': len(enhanced_tarot_engine.get_available_spreads()),
            'test_card': test_card.name if test_card else None,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logging.error(f"Tarot health check error: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500