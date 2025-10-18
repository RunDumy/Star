"""
Oracle Integration for Star Platform
Integrates the Oracle Engine with the main Flask application
"""

import logging
from typing import Optional

from flask import Flask
from oracle_api import init_oracle_engine, oracle_bp
from oracle_engine import OccultOracleEngine


def register_oracle_routes(app: Flask, ai_client=None) -> bool:
    """
    Register Oracle API routes with the Flask app
    
    Args:
        app: Flask application instance
        ai_client: Optional AI client for enhanced interpretations
        
    Returns:
        bool: True if registration successful, False otherwise
    """
    try:
        # Initialize the oracle engine
        init_oracle_engine(ai_client)
        
        # Register the oracle blueprint
        app.register_blueprint(oracle_bp)
        
        logging.info("Oracle API routes registered successfully")
        return True
        
    except Exception as e:
        logging.error(f"Failed to register Oracle API routes: {e}")
        return False

def get_oracle_engine() -> Optional[OccultOracleEngine]:
    """Get the global oracle engine instance"""
    from oracle_api import oracle_engine
    return oracle_engine

def test_oracle_integration(app: Flask) -> bool:
    """
    Test Oracle integration with the Flask app
    
    Args:
        app: Flask application instance
        
    Returns:
        bool: True if all tests pass, False otherwise
    """
    try:
        with app.test_client() as client:
            # Test health endpoint
            response = client.get('/api/v1/oracle/health')
            if response.status_code != 200:
                logging.error(f"Oracle health check failed: {response.status_code}")
                return False
            
            # Test status endpoint
            response = client.get('/api/v1/oracle/status')
            if response.status_code != 200:
                logging.error(f"Oracle status check failed: {response.status_code}")
                return False
            
            # Test moon phase endpoint
            response = client.get('/api/v1/oracle/moon/current')
            if response.status_code != 200:
                logging.error(f"Oracle moon phase check failed: {response.status_code}")
                return False
            
            logging.info("Oracle integration tests passed")
            return True
            
    except Exception as e:
        logging.error(f"Oracle integration test failed: {e}")
        return False

class OracleConfig:
    """Configuration class for Oracle settings"""
    
    # Rate limiting settings
    RATE_LIMIT_ENABLED = True
    RATE_LIMIT_PER_HOUR = 100
    RATE_LIMIT_PER_MINUTE = 10
    RATE_LIMIT_TAROT = "5 per minute"
    RATE_LIMIT_ICHING = "3 per minute"
    RATE_LIMIT_COMPLETE_SESSION = "2 per minute"
    
    # Cache settings
    CACHE_ENABLED = True
    CACHE_TTL_NATAL_CHART = 3600  # 1 hour
    CACHE_TTL_MOON_PHASE = 300    # 5 minutes
    
    # AI settings
    AI_ENABLED = False
    AI_TIMEOUT = 30
    AI_FALLBACK_ENABLED = True
    
    # Database settings
    DB_ENABLED = True
    DB_TIMEOUT = 10
    
    # Logging settings
    LOG_LEVEL = "INFO"
    LOG_ORACLE_REQUESTS = True
    LOG_PERFORMANCE = True

def configure_oracle_logging(app: Flask):
    """Configure logging for Oracle operations"""
    
    # Create oracle-specific logger
    oracle_logger = logging.getLogger('oracle')
    oracle_logger.setLevel(getattr(logging, OracleConfig.LOG_LEVEL))
    
    # Create handler if it doesn't exist
    if not oracle_logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        oracle_logger.addHandler(handler)
    
    # Log oracle initialization
    oracle_logger.info("Oracle logging configured")

def validate_oracle_dependencies() -> tuple[bool, list[str]]:
    """
    Validate that all Oracle dependencies are available
    
    Returns:
        tuple: (success: bool, missing_dependencies: list[str])
    """
    missing_deps = []
    
    try:
        import ephem
    except ImportError:
        missing_deps.append("ephem")
    
    try:
        from cosmos_db import get_cosmos_helper
        cosmos_helper = get_cosmos_helper()
        if not cosmos_helper:
            missing_deps.append("cosmos_db (not configured)")
    except ImportError:
        missing_deps.append("cosmos_db")
    
    try:
        from star_auth import token_required
    except ImportError:
        missing_deps.append("star_auth")
    
    return len(missing_deps) == 0, missing_deps

# Oracle API Documentation for Frontend Integration
ORACLE_API_DOCS = {
    "base_url": "/api/v1/oracle",
    "authentication": "Bearer token required for most endpoints",
    "rate_limits": {
        "general": "100 per hour, 10 per minute",
        "tarot_reading": "5 per minute",
        "iching_cast": "3 per minute",
        "complete_session": "2 per minute"
    },
    "endpoints": {
        "health": {
            "method": "GET",
            "url": "/health",
            "description": "Get Oracle engine health status",
            "auth_required": False
        },
        "status": {
            "method": "GET", 
            "url": "/status",
            "description": "Get Oracle engine capabilities",
            "auth_required": False
        },
        "tarot_spreads": {
            "method": "GET",
            "url": "/tarot/spreads",
            "description": "Get available tarot spreads",
            "auth_required": False
        },
        "tarot_reading": {
            "method": "POST",
            "url": "/tarot/reading",
            "description": "Create enhanced tarot reading",
            "auth_required": True,
            "params": {
                "spread": "string (optional, default: Celtic Cross)",
                "question": "string (optional)"
            }
        },
        "natal_chart": {
            "method": "POST",
            "url": "/astrology/natal-chart",
            "description": "Calculate natal chart",
            "auth_required": True,
            "params": {
                "birth_date": "string (ISO format) or datetime",
                "birth_place": "string (city name)"
            }
        },
        "aspects": {
            "method": "POST",
            "url": "/astrology/aspects",
            "description": "Calculate planetary aspects",
            "auth_required": True,
            "params": {
                "birth_date": "string (ISO format) or datetime",
                "birth_place": "string (city name)",
                "orb_tolerance": "float (optional, default: 8.0)"
            }
        },
        "transits": {
            "method": "POST",
            "url": "/astrology/transits",
            "description": "Calculate current transits",
            "auth_required": True,
            "params": {
                "birth_date": "string (ISO format) or datetime",
                "birth_place": "string (city name)",
                "days_ahead": "int (optional, default: 30)"
            }
        },
        "current_moon": {
            "method": "GET",
            "url": "/moon/current",
            "description": "Get current moon phase and guidance",
            "auth_required": False
        },
        "lunar_guidance": {
            "method": "GET",
            "url": "/moon/guidance",
            "description": "Get lunar guidance for specific date",
            "auth_required": False,
            "params": {
                "date": "string (optional, ISO format)"
            }
        },
        "numerology": {
            "method": "POST",
            "url": "/numerology/calculate",
            "description": "Calculate advanced numerology profile",
            "auth_required": True,
            "params": {
                "name": "string",
                "birth_date": "string (ISO format) or datetime"
            }
        },
        "iching": {
            "method": "POST",
            "url": "/iching/cast",
            "description": "Cast I Ching hexagram",
            "auth_required": True,
            "params": {
                "question": "string (optional)"
            }
        },
        "complete_session": {
            "method": "POST",
            "url": "/session/complete",
            "description": "Create complete oracle session with all methods",
            "auth_required": True,
            "params": {
                "name": "string",
                "birth_date": "string (ISO format) or datetime",
                "birth_place": "string (city name)",
                "question": "string (optional)"
            }
        }
    }
}

def get_oracle_api_documentation() -> dict:
    """Get Oracle API documentation for frontend developers"""
    return ORACLE_API_DOCS

# Example usage for main app.py integration:
"""
from oracle_integration import register_oracle_routes, test_oracle_integration, configure_oracle_logging

def create_app():
    app = Flask(__name__)
    
    # Configure Oracle logging
    configure_oracle_logging(app)
    
    # Register Oracle routes
    success = register_oracle_routes(app, ai_client=your_ai_client)
    if not success:
        app.logger.error("Failed to register Oracle routes")
    
    # Test Oracle integration in development
    if app.config.get('TESTING') or app.config.get('DEBUG'):
        if test_oracle_integration(app):
            app.logger.info("Oracle integration test passed")
        else:
            app.logger.error("Oracle integration test failed")
    
    return app
"""