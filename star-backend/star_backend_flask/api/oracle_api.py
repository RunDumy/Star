"""
Oracle API Integration for Star Platform
Flask endpoints for the Occult Oracle Engine
"""

import datetime
import json
import logging
from functools import wraps
from typing import Any, Dict, Optional

from cosmos_db import get_cosmos_helper
from flask import Blueprint, g, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from oracle_engine import (MoonPhase, OccultOracleEngine, TarotSpread,
                           ZodiacSign)
from star_auth import token_required

# Initialize Oracle API Blueprint
oracle_bp = Blueprint('oracle', __name__, url_prefix='/api/v1/oracle')

# Rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per hour", "10 per minute"]
)

# Global oracle engine instance (initialized in app startup)
oracle_engine: Optional[OccultOracleEngine] = None

def init_oracle_engine(ai_client=None):
    """Initialize the oracle engine with dependencies"""
    global oracle_engine
    cosmos_helper = get_cosmos_helper()
    oracle_engine = OccultOracleEngine(cosmos_helper, ai_client)
    logging.info("Oracle Engine initialized successfully")

def oracle_required(f):
    """Decorator to ensure oracle engine is available"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not oracle_engine:
            return jsonify({
                'error': 'Oracle service unavailable',
                'message': 'The cosmic forces are temporarily misaligned'
            }), 503
        return f(*args, **kwargs)
    return decorated_function

def validate_birth_data(data: Dict) -> tuple[bool, str]:
    """Validate birth data requirements"""
    required_fields = ['birth_date', 'birth_place']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    try:
        # Validate date format
        if isinstance(data['birth_date'], str):
            datetime.datetime.fromisoformat(data['birth_date'])
        elif not isinstance(data['birth_date'], datetime.datetime):
            return False, "Invalid birth_date format. Use ISO format or datetime object"
    except ValueError:
        return False, "Invalid birth_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
    
    if not isinstance(data['birth_place'], str) or len(data['birth_place'].strip()) < 2:
        return False, "Birth place must be a valid city name"
    
    return True, ""

# ========== HEALTH & STATUS ENDPOINTS ==========

@oracle_bp.route('/health', methods=['GET'])
@oracle_required
def oracle_health():
    """Get oracle engine health status"""
    try:
        health = oracle_engine.health_check()
        performance = oracle_engine.get_performance_stats()
        
        return jsonify({
            'status': 'success',
            'health': health,
            'performance': performance,
            'timestamp': datetime.datetime.now().isoformat()
        })
    except Exception as e:
        logging.error(f"Oracle health check failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Health check failed',
            'error': str(e)
        }), 500

@oracle_bp.route('/status', methods=['GET'])
@oracle_required
def oracle_status():
    """Get oracle engine status and capabilities"""
    try:
        status = oracle_engine.to_dict()
        return jsonify({
            'status': 'success',
            'oracle_engine': status
        })
    except Exception as e:
        logging.error(f"Oracle status failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Status check failed',
            'error': str(e)
        }), 500

# ========== TAROT ENDPOINTS ==========

@oracle_bp.route('/tarot/spreads', methods=['GET'])
@oracle_required
def get_tarot_spreads():
    """Get available tarot spreads"""
    try:
        spreads = []
        for spread in TarotSpread:
            spreads.append({
                'name': spread.value[0],
                'card_count': spread.value[1],
                'positions': spread.value[2]
            })
        
        return jsonify({
            'status': 'success',
            'spreads': spreads
        })
    except Exception as e:
        logging.error(f"Get tarot spreads failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to get tarot spreads',
            'error': str(e)
        }), 500

@oracle_bp.route('/tarot/reading', methods=['POST'])
@token_required
@oracle_required
@limiter.limit("5 per minute")
def create_tarot_reading():
    """Create enhanced tarot reading"""
    try:
        data = request.get_json()
        user_id = g.current_user.get('id') if hasattr(g, 'current_user') else 'anonymous'
        
        # Get parameters
        spread_name = data.get('spread', 'Celtic Cross')
        question = data.get('question', '')
        
        # Find spread enum
        spread_type = next(
            (spread for spread in TarotSpread if spread.value[0] == spread_name),
            TarotSpread.CELTIC_CROSS
        )
        
        # Perform reading
        reading = oracle_engine.enhanced_tarot_reading(
            spread_type=spread_type,
            question=question,
            user_id=user_id
        )
        
        # Convert to API response
        response = {
            'status': 'success',
            'reading': {
                'id': reading.id,
                'spread_type': reading.spread_type.value[0],
                'question': question,
                'cards': [
                    {
                        'name': card_name,
                        'reversed': reversed_flag,
                        'position': position,
                        'position_meaning': position
                    }
                    for card_name, reversed_flag, position in reading.cards
                ],
                'overall_energy': reading.overall_energy,
                'ai_interpretation': reading.ai_interpretation,
                'lunar_influence': reading.lunar_influence,
                'timestamp': reading.timestamp.isoformat()
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logging.error(f"Tarot reading failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to create tarot reading',
            'error': str(e)
        }), 500

@oracle_bp.route('/tarot/readings/<user_id>', methods=['GET'])
@token_required
@oracle_required
def get_user_tarot_readings(user_id: str):
    """Get user's tarot reading history"""
    try:
        # Verify user can access these readings
        current_user_id = g.current_user.get('id') if hasattr(g, 'current_user') else None
        if current_user_id != user_id:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized access'
            }), 403
        
        limit = request.args.get('limit', 10, type=int)
        readings = oracle_engine.get_user_readings(user_id, limit)
        
        readings_data = []
        for reading in readings:
            readings_data.append({
                'id': reading.id,
                'spread_type': reading.spread_type.value[0],
                'overall_energy': reading.overall_energy,
                'timestamp': reading.timestamp.isoformat()
            })
        
        return jsonify({
            'status': 'success',
            'readings': readings_data,
            'count': len(readings_data)
        })
        
    except Exception as e:
        logging.error(f"Get user readings failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to get user readings',
            'error': str(e)
        }), 500

# ========== ASTROLOGY ENDPOINTS ==========

@oracle_bp.route('/astrology/natal-chart', methods=['POST'])
@token_required
@oracle_required
@limiter.limit("10 per minute")
def calculate_natal_chart():
    """Calculate natal chart"""
    try:
        data = request.get_json()
        
        # Validate birth data
        valid, error_msg = validate_birth_data(data)
        if not valid:
            return jsonify({
                'status': 'error',
                'message': error_msg
            }), 400
        
        birth_date = data['birth_date']
        if isinstance(birth_date, str):
            birth_date = datetime.datetime.fromisoformat(birth_date)
        
        birth_place = data['birth_place']
        
        # Calculate chart with caching
        chart = oracle_engine.calculate_natal_chart_cached(birth_date, birth_place)
        
        # Convert to API response
        response = {
            'status': 'success',
            'natal_chart': {
                'sun': {
                    'sign': chart.sun.zodiac_sign.value[0],
                    'degree': round(chart.sun.degree, 2),
                    'longitude': round(chart.sun.longitude, 2)
                },
                'moon': {
                    'sign': chart.moon.zodiac_sign.value[0],
                    'degree': round(chart.moon.degree, 2),
                    'longitude': round(chart.moon.longitude, 2)
                },
                'mercury': {
                    'sign': chart.mercury.zodiac_sign.value[0],
                    'degree': round(chart.mercury.degree, 2)
                },
                'venus': {
                    'sign': chart.venus.zodiac_sign.value[0],
                    'degree': round(chart.venus.degree, 2)
                },
                'mars': {
                    'sign': chart.mars.zodiac_sign.value[0],
                    'degree': round(chart.mars.degree, 2)
                },
                'jupiter': {
                    'sign': chart.jupiter.zodiac_sign.value[0],
                    'degree': round(chart.jupiter.degree, 2)
                },
                'saturn': {
                    'sign': chart.saturn.zodiac_sign.value[0],
                    'degree': round(chart.saturn.degree, 2)
                },
                'ascendant': {
                    'sign': chart.ascendant.zodiac_sign.value[0],
                    'degree': round(chart.ascendant.degree, 2)
                },
                'midheaven': {
                    'sign': chart.midheaven.zodiac_sign.value[0],
                    'degree': round(chart.midheaven.degree, 2)
                },
                'houses': [round(house, 2) for house in chart.houses]
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logging.error(f"Natal chart calculation failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to calculate natal chart',
            'error': str(e)
        }), 500

@oracle_bp.route('/astrology/aspects', methods=['POST'])
@token_required
@oracle_required
def calculate_aspects():
    """Calculate planetary aspects"""
    try:
        data = request.get_json()
        
        # Validate birth data
        valid, error_msg = validate_birth_data(data)
        if not valid:
            return jsonify({
                'status': 'error',
                'message': error_msg
            }), 400
        
        birth_date = data['birth_date']
        if isinstance(birth_date, str):
            birth_date = datetime.datetime.fromisoformat(birth_date)
        
        birth_place = data['birth_place']
        orb_tolerance = data.get('orb_tolerance', 8.0)
        
        # Calculate chart and aspects
        chart = oracle_engine.calculate_natal_chart_cached(birth_date, birth_place)
        aspects = oracle_engine.calculate_aspects(chart, orb_tolerance)
        
        # Convert to API response
        aspects_data = []
        for aspect in aspects:
            aspects_data.append({
                'planet1': aspect.planet1,
                'planet2': aspect.planet2,
                'aspect': aspect.aspect_type.value[0],
                'orb': round(aspect.orb, 2),
                'exact_angle': round(aspect.exact_angle, 2),
                'applying': aspect.applying,
                'interpretation': aspect.interpretation
            })
        
        return jsonify({
            'status': 'success',
            'aspects': aspects_data,
            'count': len(aspects_data)
        })
        
    except Exception as e:
        logging.error(f"Aspect calculation failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to calculate aspects',
            'error': str(e)
        }), 500

@oracle_bp.route('/astrology/transits', methods=['POST'])
@token_required
@oracle_required
def calculate_transits():
    """Calculate current transits"""
    try:
        data = request.get_json()
        
        # Validate birth data
        valid, error_msg = validate_birth_data(data)
        if not valid:
            return jsonify({
                'status': 'error',
                'message': error_msg
            }), 400
        
        birth_date = data['birth_date']
        if isinstance(birth_date, str):
            birth_date = datetime.datetime.fromisoformat(birth_date)
        
        birth_place = data['birth_place']
        days_ahead = data.get('days_ahead', 30)
        
        # Calculate chart and transits
        chart = oracle_engine.calculate_natal_chart_cached(birth_date, birth_place)
        transits = oracle_engine.calculate_transits(chart, days_ahead=days_ahead)
        
        # Convert to API response
        transits_data = []
        for transit in transits:
            transits_data.append({
                'transiting_planet': transit.transiting_planet,
                'natal_planet': transit.natal_planet,
                'aspect': transit.aspect_type.value[0],
                'exact_date': transit.exact_date.isoformat(),
                'orb': round(transit.orb, 2),
                'interpretation': transit.interpretation,
                'peak_influence': {
                    'start': transit.peak_influence[0].isoformat(),
                    'end': transit.peak_influence[1].isoformat()
                }
            })
        
        return jsonify({
            'status': 'success',
            'transits': transits_data,
            'count': len(transits_data)
        })
        
    except Exception as e:
        logging.error(f"Transit calculation failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to calculate transits',
            'error': str(e)
        }), 500

# ========== MOON PHASE ENDPOINTS ==========

@oracle_bp.route('/moon/current', methods=['GET'])
@oracle_required
def get_current_moon():
    """Get current moon phase and data"""
    try:
        moon_data = oracle_engine.calculate_moon_phase()
        lunar_guidance = oracle_engine.get_lunar_guidance()
        
        return jsonify({
            'status': 'success',
            'moon_data': {
                'phase': moon_data.phase.value[0],
                'illumination': round(moon_data.illumination, 1),
                'zodiac_sign': moon_data.zodiac_sign.value[0],
                'degree': round(moon_data.degree, 1),
                'void_of_course': moon_data.void_of_course
            },
            'guidance': lunar_guidance
        })
        
    except Exception as e:
        logging.error(f"Moon phase calculation failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to get moon phase',
            'error': str(e)
        }), 500

@oracle_bp.route('/moon/guidance', methods=['GET'])
@oracle_required
def get_lunar_guidance():
    """Get lunar guidance for specific date"""
    try:
        date_str = request.args.get('date')
        date = None
        
        if date_str:
            try:
                date = datetime.datetime.fromisoformat(date_str)
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'
                }), 400
        
        guidance = oracle_engine.get_lunar_guidance(date)
        
        return jsonify({
            'status': 'success',
            'guidance': guidance
        })
        
    except Exception as e:
        logging.error(f"Lunar guidance failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to get lunar guidance',
            'error': str(e)
        }), 500

# ========== NUMEROLOGY ENDPOINTS ==========

@oracle_bp.route('/numerology/calculate', methods=['POST'])
@token_required
@oracle_required
def calculate_numerology():
    """Calculate advanced numerology profile"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'name' not in data or 'birth_date' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required fields: name, birth_date'
            }), 400
        
        name = data['name']
        birth_date = data['birth_date']
        
        if isinstance(birth_date, str):
            birth_date = datetime.datetime.fromisoformat(birth_date)
        
        # Calculate numerology
        numerology = oracle_engine.calculate_advanced_numerology(name, birth_date)
        
        return jsonify({
            'status': 'success',
            'numerology': numerology
        })
        
    except Exception as e:
        logging.error(f"Numerology calculation failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to calculate numerology',
            'error': str(e)
        }), 500

# ========== I CHING ENDPOINTS ==========

@oracle_bp.route('/iching/cast', methods=['POST'])
@token_required
@oracle_required
@limiter.limit("3 per minute")
def cast_i_ching():
    """Cast I Ching hexagram"""
    try:
        data = request.get_json() or {}
        question = data.get('question', '')
        
        # Cast hexagram
        hexagram = oracle_engine.cast_i_ching(question)
        
        return jsonify({
            'status': 'success',
            'hexagram': {
                'number': hexagram.number,
                'name': hexagram.name,
                'trigrams': {
                    'upper': hexagram.trigrams[0],
                    'lower': hexagram.trigrams[1]
                },
                'meaning': hexagram.meaning,
                'judgment': hexagram.judgment,
                'image': hexagram.image,
                'changing_lines': hexagram.changing_lines,
                'question': question
            }
        })
        
    except Exception as e:
        logging.error(f"I Ching casting failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to cast I Ching',
            'error': str(e)
        }), 500

# ========== COMPLETE ORACLE SESSION ==========

@oracle_bp.route('/session/complete', methods=['POST'])
@token_required
@oracle_required
@limiter.limit("2 per minute")
def create_complete_oracle_session():
    """Create complete oracle session with all divination methods"""
    try:
        data = request.get_json()
        user_id = g.current_user.get('id') if hasattr(g, 'current_user') else 'anonymous'
        
        # Validate required fields
        required_fields = ['name', 'birth_date', 'birth_place']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'status': 'error',
                'message': f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        name = data['name']
        birth_date = data['birth_date']
        birth_place = data['birth_place']
        question = data.get('question', '')
        
        if isinstance(birth_date, str):
            birth_date = datetime.datetime.fromisoformat(birth_date)
        
        # Create complete oracle session
        session = oracle_engine.create_complete_oracle_session(
            user_id=user_id,
            name=name,
            birth_date=birth_date,
            birth_place=birth_place,
            question=question
        )
        
        # Convert to API response
        response = {
            'status': 'success',
            'session': {
                'id': session.session_id,
                'timestamp': session.timestamp.isoformat(),
                'summary': session.session_summary,
                'recommendations': session.recommendations,
                'tarot_reading_id': session.tarot_reading.id if session.tarot_reading else None,
                'numerology_highlights': {
                    'life_path': session.numerology_profile.get('life_path'),
                    'personal_year': session.numerology_profile.get('personal_year'),
                    'personal_year_meaning': session.numerology_profile.get('personal_year_meaning')
                },
                'moon_phase': session.moon_data.phase.value[0],
                'i_ching_hexagram': {
                    'name': session.i_ching_hexagram.name,
                    'number': session.i_ching_hexagram.number,
                    'meaning': session.i_ching_hexagram.meaning
                } if session.i_ching_hexagram else None,
                'major_transits': len([t for t in session.current_transits if 'Jupiter' in t.transiting_planet or 'Saturn' in t.transiting_planet])
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logging.error(f"Complete oracle session failed: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to create oracle session',
            'error': str(e)
        }), 500

# ========== ERROR HANDLERS ==========

@oracle_bp.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded"""
    return jsonify({
        'status': 'error',
        'message': 'Rate limit exceeded. The cosmic forces require patience.',
        'retry_after': e.retry_after
    }), 429

@oracle_bp.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logging.error(f"Oracle API internal error: {error}")
    return jsonify({
        'status': 'error',
        'message': 'The cosmic energies are disturbed. Please try again.'
    }), 500

@oracle_bp.errorhandler(404)
def not_found(error):
    """Handle not found errors"""
    return jsonify({
        'status': 'error',
        'message': 'Oracle endpoint not found in the cosmic database'
    }), 404

# ========== UTILITY FUNCTIONS ==========

def format_error_response(message: str, error: str = None, status_code: int = 500):
    """Format consistent error responses"""
    response = {
        'status': 'error',
        'message': message,
        'timestamp': datetime.datetime.now().isoformat()
    }
    
    if error:
        response['error'] = error
    
    return jsonify(response), status_code

def format_success_response(data: Dict[str, Any], message: str = "Success"):
    """Format consistent success responses"""
    response = {
        'status': 'success',
        'message': message,
        'timestamp': datetime.datetime.now().isoformat(),
        **data
    }
    
    return jsonify(response)