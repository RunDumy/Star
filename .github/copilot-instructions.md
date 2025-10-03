<!-- Copilot / AI agent instructions for the Star repository (concise) -->
# Copilot Instructions for STAR Platform

## Overview
STAR is a monorepo with a Next.js + TypeScript frontend (`star-frontend/`) and a Flask backend (`star-backend/star_backend_flask/`) using Supabase. An experimental FastAPI backend exists (`star-backend/main.py`). Docker ensures error-free local setup, with Render (backend) and Vercel (frontend) for deployment. Jest and pytest handle testing, with GitHub Actions for CI/CD.

## Architecture
- **Frontend (`star-frontend/`)**: Next.js + React + TypeScript. Key files:
  - `pages/` (routes), `components/` (UI), `hooks/` (logic), `utils/` (helpers).
  - `next.config.js`, `package.json`, `tsconfig.json`, `jest.config.js` (in `star-frontend/`).
  - `.env.local` for API endpoint (e.g., `NEXT_PUBLIC_API_URL=http://localhost:5000` locally).
- **Backend (`star-backend/`)**: Flask app (`star_backend_flask/app.py`) is primary; FastAPI (`main.py`) is experimental. Key files:
  - `star_backend_flask/api.py`: API endpoints (`/api/*`, e.g., `/api/users`).
  - `star_auth.py`: Authentication with `@token_required`.
  - `database/supabase_schema.sql`: Supabase schema.
  - `requirements.txt`: Flask dependencies.
- **Data Flow**: Frontend calls `/api/*` endpoints; backend queries Supabase via `supabase-py`, returning `{ data, error }`.
- **Why**: Monorepo simplifies dependency management; Flask for production, FastAPI for experimentation; Supabase for scalable database; Docker for consistent environments.

## File Placement
- **Frontend**: All configs (`next.config.js`, `package.json`, `tsconfig.json`, `jest.config.js`) in `star-frontend/`. Move root-level configs to `star-frontend/`.
- **Backend**: Core files (`app.py`, `api.py`, `star_auth.py`) in `star-backend/star_backend_flask/`. Database files (`supabase_schema.sql`) in `star-backend/database/`. Move root-level `main.py`, `star_auth.py`, `supabase_schema.sql` to `star-backend/`.
- **Config**: Deployment configs in `config/` (e.g., `config/render/render.yaml`, `config/vercel/vercel.json`, `config/docker/docker-compose.yml`).
- **Tests**: Backend tests in `tests/backend/test_*.py` (e.g., `test_api.py`); frontend tests in `star-frontend/__tests__/*.test.tsx`.

## Developer Workflows
- **Docker Setup (Required)**:
  - Install Docker Desktop on Windows.
  - Run `docker-compose -f config/docker/docker-compose.yml up --build` to start backend, frontend, and Supabase locally.
- **Backend Setup (Without Docker)**:
  - Navigate to `star-backend/star_backend_flask/`.
  - Run `pip install -r requirements.txt`, then `flask run`.
  - For FastAPI: `cd star-backend; uvicorn star_backend_flask.api:app --reload`.
- **Frontend Setup (Without Docker)**:
  - Navigate to `star-frontend/`.
  - Run `npm install`, then `npm run dev`.
- **Testing**:
  - Backend: `cd tests/backend; pytest test_api.py` (API tests). Requires local Supabase via Docker or `SUPABASE_TEST_URL`.
  - Frontend: `cd star-frontend; npm test` (Jest, `jest.config.js`).
- **Debugging**:
  - Backend: Logs to `app.log`. Use `flask run --debug` or Docker logs.
  - Frontend: Use Next.js dev tools or VS Code debugger.
- **Deployment**:
  - Backend: `config/render/render.yaml` deploys `star-backend/` to Render (`uvicorn star_backend_flask.api:app`).
  - Frontend: `config/vercel/vercel.json` for Vercel. Deploy with `cd star-frontend; vercel deploy --prod`.
  - Local: `docker-compose -f config/docker/docker-compose.yml up --build`.
- **CI/CD**: GitHub Actions in `.github/workflows/` (e.g., `test.yml`, `deploy.yml`).

## Conventions
- **Backend**:
  - API endpoints in `star_backend_flask/api.py` use `/api/*` (e.g., `/api/posts`).
  - Use `@token_required` from `star_auth.py` for protected routes.
  - Supabase responses: `res.data` (success), `res.error` (failure).
  - Log to `app.log` using `logging` module.
- **Frontend**:
  - TypeScript with strict mode (`tsconfig.json`).
  - API calls via `fetch` to `NEXT_PUBLIC_API_URL` (in `.env.local`).
- **Testing**:
  - Backend tests: `tests/backend/test_api.py` (tests `/api/*` with `supabase-py`).
  - Frontend tests: `star-frontend/__tests__/*.test.tsx`.
- **File Naming**: snake_case for Python (e.g., `test_api.py`), camelCase for TypeScript (e.g., `useAuth.ts`).

## Integration Points
- **Supabase**:
  - Configured via `SUPABASE_URL`/`SUPABASE_KEY` in `star-backend/.env`.
  - Schema in `star-backend/database/supabase_schema.sql`. Apply with `cd star-backend; supabase db push`.
  - Use `supabase-py` in `star_backend_flask/` for queries.
- **Vercel CLI**:
  - Install: `npm install -g vercel`.
  - Deploy frontend: `cd star-frontend; vercel deploy --prod`.
  - Configure in `config/vercel/vercel.json` for rewrites to `/api/*`.
- **Render**: Configured in `config/render/render.yaml` for backend deployment.
- **Docker**: Use `config/docker/docker-compose.yml` for local backend/frontend/Supabase.
- **Cross-Component**: Frontend calls `/api/*`; backend handles auth and Supabase queries.

## Gotchas
- **Duplicate Backends**: Use `star-backend/` (canonical, used by Render). Merge unique files from `backend/` and delete it.
- **Large Files**: Exclude `*.zip`, `*.tar.gz`, `*.exe`, `*.msi`, `*.log`, `jre/` in `.gitignore`. Check with `git status`.
- **Secrets**: Never commit secrets in `render.yaml`, `vercel.json`, or `.env`. Use `config/env/ROTATE_SECRETS.md`.
- **Docker**: Required for local Supabase and production-like testing. Ensure Docker Desktop is installed.

## Checklist for Contributions
- Move frontend configs (e.g., `next.config.js`) to `star-frontend/`.
- Move backend files (e.g., `main.py`, `star_auth.py`) to `star-backend/star_backend_flask/`.
- Place `supabase_schema.sql` in `star-backend/database/`.
- Run `cd tests/backend; pytest test_api.py` for API tests.
- Verify with `docker-compose -f config/docker/docker-compose.yml up --build`.
- Check `app.log` for errors.
- Deploy frontend: `cd star-frontend; vercel deploy --prod`.
- Deploy backend: Verify `config/render/render.yaml` and redeploy on Render.
- Avoid large files: Update `.gitignore` and check `git status`.
