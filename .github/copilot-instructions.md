# Copilot / AI agent instructions for the Star repository

This file collects the minimal, high-value knowledge an AI coding agent needs to be immediately productive in this repository. Keep this short and actionable (20–50 lines).

1) Project overview (big picture)
- Monorepo with two primary user-facing parts: a Flask backend (located under `star-backend/star_backend_flask`) and a Next.js frontend (`star-frontend`). There is also an alternate FastAPI backend under `star-backend/star_backend` — be careful which backend you edit. Entry points: `star-backend/star_backend_flask/app.py` (Flask) and `star-frontend` for UI.
- Data storage uses Supabase; schema is in `supabase/supabase` and `supabase_schema.sql`. Backend modules call the Supabase Python client.

2) Key files and where to look first
- `star-backend/star_backend_flask/app.py` — main Flask routes, logging, and Flask app wiring.
- `star_auth.py` — JWT token helpers and `token_required` decorator used to protect API endpoints.
- `star-backend/star_backend_flask/{archetype_oracle.py,birth_chart.py,numerology.py,tarot_interactions.py}` — domain logic for astrology features.
- `star-frontend/` — Next.js app (look at `src/` for components that call `/api/*` endpoints).
- `main.py` at repo root — contains runtime wiring and duplicate blocks; grep before editing to avoid conflicts.

3) Conventions and patterns
- Routes and API shape: Frontend posts JSON to `/api/*` Flask endpoints. Example: add an endpoint in `app.py` like `@app.route('/api/birth_chart', methods=['POST'])` and protect with `@token_required` when needed.
- Supabase access: use `create_client(SUPABASE_URL, SUPABASE_ANON_KEY)` and check `res.data` and `res.error` on responses. See existing usage in backend modules.
- Logging: backend config writes logs to `app.log` in `star-backend/star_backend_flask/` — avoid committing logs. Use Python `logging` consistent with existing setup.
- Tests: Pytest is used for backend tests (see `test_*.py` files in repo root and `tests/`). Frontend uses Jest config under `star-frontend`.

4) Developer workflows (commands)
- Backend (local):
  - create and activate a venv, then `pip install -r requirements.txt` (root or `star-backend` as appropriate).
  - run Flask app: `python star-backend/star_backend_flask/app.py` (this is the project convention). Check `app.log` for runtime logs.
- Frontend (local):
  - from `star-frontend`: `npm install` then `npm run dev` to start Next.js dev server. The workspace also has a VS Code task labeled "Run Next.js Frontend".
- Tests:
  - Backend pytest: `pytest tests/` or `pytest` at repo root (see `conftest.py`).
  - Frontend tests: `npm test` within `star-frontend`.

5) Integration & deployment notes
- Deployments: `render.yaml` (root and in `star-backend`) and `vercel.json` are present. Secrets should not be hard-coded in these files — they belong in the platform environment variables (Render / Vercel) or a local `.env` (see `ENV_VARS_TEMPLATE.md`). If you edit `render.yaml`, sanitize placeholders rather than placing real secrets.
- Database migrations and initialization: see `star-backend/star_backend_flask/init_db.py` and `supabase_schema.sql`.

6) Safety / gotchas observed in the repo
- There are duplicate runtime wiring blocks across `main.py` and backend folders; changing the wrong entrypoint can cause confusion. Grep for the route or symbol before editing.
- `app.log` files are present in the repo — avoid committing runtime logs; prefer updating `.gitignore` if needed.

7) Small-edit checklist for making a backend change
- Add endpoint to `star-backend/star_backend_flask/app.py` or a blueprint under the same package.
- Protect endpoints with `@token_required` (from `star_auth.py`) if they should be authenticated. Tests rely on tokens in existing test files.
- Use existing Supabase client pattern for DB access.
- Run unit tests (`pytest`) and check `app.log` only for local debugging; don't commit it.

8) Where to add automated tests
- Add pytest tests beside `tests/` or under `test/` matching the existing naming patterns (e.g., `test_<feature>.py`). Look at `test_main_api.py` and `test_token_required.py` for examples of auth testing.

9) If you can't find something
- Grep for the symbol across workspace (`cargo` style search is not available here) or search for `/api/` route names. Check both Flask and FastAPI folders before deciding where to place code.

If anything is unclear or you'd like a different focus (for example, more deployment guidance, CI, or security checks), tell me which sections to expand and I will iterate.
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
