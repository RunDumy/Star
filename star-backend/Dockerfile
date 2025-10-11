FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements from the Flask app directory
COPY star_backend_flask/requirements.txt .

# Install Python dependencies including eventlet for SocketIO
RUN pip install --no-cache-dir -r requirements.txt gunicorn==21.2.0 eventlet==0.33.3

# Copy the Flask application
COPY star_backend_flask/ .

# Copy the frontend static files (will be handled during deployment)
# COPY star-frontend/out ./static/

# Set environment variables
ENV FLASK_ENV=production
ENV PORT=8000
ENV PYTHONPATH=/app

# Expose the port
EXPOSE 8000

# Use Gunicorn with eventlet worker for SocketIO support
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "--bind", "0.0.0.0:8000", "--timeout", "120", "app:app"]