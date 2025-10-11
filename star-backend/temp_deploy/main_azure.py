# Azure App Service Configuration for STAR Backend
import os
import sys

# Add the star_backend_flask directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'star_backend_flask'))

# Import the production app
from app_production import application

# Azure App Service looks for 'application' variable
if __name__ == "__main__":
    application.run()