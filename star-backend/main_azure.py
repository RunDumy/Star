# Azure App Service Configuration for STAR Backend
import os
import sys

# Add the current directory to Python path for flat structure
sys.path.insert(0, os.path.dirname(__file__))

# Import the production app
from app_production import application

# Azure App Service looks for 'application' variable
if __name__ == "__main__":
    application.run()