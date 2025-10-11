# Azure App Service Test Configuration for STAR Backend
import os
import sys

# Add the current directory to Python path for flat structure
sys.path.insert(0, os.path.dirname(__file__))

# Import the test app
from app_test import application

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    application.run(host='0.0.0.0', port=port)