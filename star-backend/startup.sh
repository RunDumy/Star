#! /bin/bash
# Azure App Service startup script

echo "Starting Azure App Service deployment script"

# Navigate to the application directory
cd /home/site/wwwroot

# Install Python dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start Gunicorn with the Flask app
echo "Starting Gunicorn server..."
gunicorn --bind=0.0.0.0:$PORT --timeout 600 --chdir star_backend_flask app:app