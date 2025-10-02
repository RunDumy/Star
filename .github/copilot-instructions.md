# Copilot Instructions for Star Project

## Overview

The Star project is a web app with a Flask backend (`star-backend\star_backend_flask`) and a Next.js frontend (`star-frontend`). It provides astrology features (birth charts, numerology, tarot) using Supabase for data storage. Deployments use Render (`render.yaml`) and Vercel (`vercel.json`).

## Architecture

- **Backend**: Flask app in `star-backend\star_backend_flask\app.py`. Key modules: `archetype_oracle.py`, `birth_chart.py`, `numerology.py`, `tarot_interactions.py`. Uses Supabase (`supabase_schema.sql`, `init_db.py`).
- **Frontend**: Next.js in `star-frontend`, configured via `next.config.js`, `package.json`.
- **Auth**: `star_auth.py` handles JWT-based authentication for API routes.
- **Data Flow**: Frontend sends HTTP requests to Flask endpoints; backend queries Supabase.

## Workflows

- **Setup**:
  - Backend: `cd star-backend`, activate `.venv\Scripts\activate`, `pip install -r requirements.txt`, run `python star_backend_flask\app.py`.
  - Frontend: `npm install`, `npm run dev` (root or `star-frontend`).
  - Database: Apply `supabase_schema.sql`, run `init_db.py` where applicable.
- **Testing**: Backend: `pytest tests/` (see `conftest.py`). Frontend: `npm test` (see `jest.config.js`).
- **Deployment**: Backend: `render.yaml` (e.g., `uvicorn star_backend_flask.api:app` or `gunicorn`). Frontend: `vercel.json` or root `render.yaml`.
- **Debugging**: Check `app.log` (root or backend). Ensure `.env` has `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

## Conventions

- **Backend Routes**: Add endpoints in `app.py` or Flask blueprints. Example: `@app.route('/api/birth_chart', methods=['POST'])`.
- **Auth**: Use `token_required` (in `star_auth.py`) to protect routes.
- **Logging**: Use Python `logging` configured in `app.py` to write to `app.log` and avoid committing logs.
- **Supabase**: Use the sync client patterns in code (create client with `SUPABASE_URL` + `SUPABASE_ANON_KEY`, check `res.data` and `res.error`).
- **Secrets**: Keep secrets out of `render.yaml` — put them in the Render dashboard or `.env` locally.

## Integration points

- **Supabase**: `supabase_schema.sql` defines tables; modules call the Supabase client to query/insert.
- **Frontend-Backend**: Client requests target `/api/*` routes implemented in Flask (or the FastAPI main backend if in use).
- **Dependencies**: Backend: Flask, Supabase client, Marshmallow schemas, Flask-Limiter. Frontend: Next.js, Tailwind (see `package.json`).

## Key files to inspect first

- `star-backend\star_backend_flask\app.py` — backend entry and routing.
- `star_auth.py` — authentication helpers and decorators.
- `supabase_schema.sql`, `supabase/migrations/` — DB schema and migration history.
- `star-frontend/src/` — frontend code and API usage patterns.

## Quick examples (copy/paste)

- Supabase client (Python):

```
from supabase import create_client
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
res = supabase.table('post').select('*').eq('id', id).execute()
if not res.data:
    # handle error
```

- New endpoint (Flask):

```
from flask import request, jsonify
@app.route('/api/example', methods=['POST'])
@token_required
def example_route(user):
    payload = request.get_json()
    # validate with Marshmallow schema
    return jsonify({'ok': True})
```

## Notes & gotchas

- `main.py` (repo root) contains authoritative runtime wiring but has duplicate blocks; later definitions override earlier ones — grep before editing.
- `star-backend/star_backend_flask/README.md` documents the Flask alternative; the repo also contains a FastAPI backend under `backend/star_backend/` — be careful which backend you change.
- Don’t commit runtime logs or secrets. If you find secrets in `render.yaml`, sanitize and rotate them.

---

If you'd like, I can now:

- Sanitize `render.yaml` by replacing secrets with placeholders and `generateValue: true` entries.
- Remove tracked `app.log` files and add them to `.gitignore`.
- Add a small endpoint template and a matching Pytest example.

Tell me which task to run next and I’ll implement it and commit the changes.
