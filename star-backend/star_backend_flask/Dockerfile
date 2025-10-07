FROM python:3.13.4-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .

# Install Python dependencies explicitly
RUN pip install --no-cache-dir -r requirements.txt gunicorn==23.0.0 redis==5.0.8

COPY . .
ENV PORT=5000

# Use the simplified app for troubleshooting
CMD ["gunicorn", "--threads", "4", "-b", "0.0.0.0:5000", "railway:app"]