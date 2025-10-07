FROM python:3.13.4-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=5000
CMD ["gunicorn", "--threads", "4", "-b", "0.0.0.0:5000", "app:app"]