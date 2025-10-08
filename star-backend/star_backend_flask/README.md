Star App - Flask backend

This folder contains an optional Flask-based implementation of the Star backend (`app.py`). The main workspace currently uses a FastAPI backend (`backend/star_backend/main.py`).

Quick start (Windows PowerShell)

1. Create a virtual environment (recommended):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies for the Flask backend:

```powershell
pip install -r ..\requirements.txt
```

3. Set required environment variables (example):

```powershell
$env:SECRET_KEY = "your-secret-key"
$env:JWT_SECRET_KEY = "your-jwt-secret"
$env:FLASK_DEBUG = "1"
$env:PORT = "5000"
```

4. Run the Flask app:

```powershell
python app.py
```

Notes

- The project already contains a FastAPI backend at `backend/star_backend/main.py`. This Flask implementation is provided as an alternative and is not wired into the rest of the project by default.
- If you choose to run the Flask backend, prefer running it in an isolated virtual environment to avoid dependency conflicts.
- Installing `eventlet` is recommended for Socket.IO async support (it's included in `backend/requirements.txt`).

Differences vs FastAPI backend

- FastAPI provides automatic OpenAPI docs, async endpoints, and is the main backend in the repository.
- The Flask app is monolithic and uses Flask-RESTful, Flask-SocketIO, and SQLAlchemy.

If you'd like, I can:

- Replace the FastAPI backend with the Flask one (risky and not recommended without tests), or
- Add a small script to run the Flask app via a separate task, or
- Create Dockerfile and compose files to run either backend in isolation.
