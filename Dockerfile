# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY star-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Flask backend code
COPY star-backend/star_backend_flask/ .

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

# Expose the port (Render will set PORT environment variable)
EXPOSE 8000

# Command to run the application (use PORT env var if available, fallback to 8000)
CMD gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:${PORT:-8000} --timeout 120 app:app