"""
Azure App Service deployment configuration
"""
import os
import sys
import logging

# Add path to make modules importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Flask app
from star_backend_flask.app import app as application

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('azure')
logger.setLevel(logging.INFO)

if __name__ == '__main__':
    # Local development server
    application.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))