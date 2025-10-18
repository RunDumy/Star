FROM python:3.12-slim
WORKDIR /app
COPY star-backend/star_backend_flask/ .
RUN pip install --no-cache-dir -r requirements.txt
ENV PORT=8000
EXPOSE $PORT
CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app:app"]
