<!-- Copilot / AI agent instructions for the Star repository (concise) -->

# Copilot Instructions for STAR Platform

## Overview

STAR is a monorepo with a Next.js + TypeScript frontend (`star-frontend/`) and a Flask backend (`star-backend/star_backend_flask/`) using Azure Cosmos DB. Docker ensures error-free local setup, with Azure App Service (backend) and Vercel (frontend) for deployment. Jest and pytest handle testing, with GitHub Actions for CI/CD. Features include interactive tarot readings, 3D collaborative cosmos, live streaming via AgoraRTC, and real-time social features.

## Architecture

- **Frontend (`star-frontend/`)**: Next.js 15 + React 18 + TypeScript. Key files:
  - `pages/` (routes), `components/` (UI), `hooks/` (logic), `lib/` (utilities).
  - `next.config.js`, `package.json`, `tsconfig.json`, `jest.config.js` (in `star-frontend/`).
  - `.env.local` for API endpoint (e.g., `NEXT_PUBLIC_API_URL=http://localhost:5000` locally).
- **Backend (`star-backend/star_backend_flask/`)**: Flask app with Azure Cosmos DB. Key files:
  - `app.py`: Main Flask application with CORS and route definitions.
  - `api.py`: API endpoints (`/api/v1/*`, e.g., `/api/v1/posts`, `/api/v1/tarot/calculate-energy-flow`).
  - `star_auth.py`: Authentication with `@token_required` decorator.
  - `cosmos_db.py`: Azure Cosmos DB helper class for database operations.
  - `oracle_engine.py`: Core occult oracle logic and AI processing.
- **Data Flow**: Frontend calls `/api/v1/*` endpoints; backend queries Azure Cosmos DB, returns JSON responses.
- **Why**: Monorepo simplifies dependency management; Flask for production stability; Azure Cosmos DB for global distribution; Docker for consistent environments; AgoraRTC for real-time live streaming.

## File Placement

- **Frontend**: All configs (`next.config.js`, `package.json`, `tsconfig.json`, `jest.config.js`) in `star-frontend/`. Move root-level configs to `star-frontend/`.
- **Backend**: Core files (`app.py`, `api.py`, `star_auth.py`, `cosmos_db.py`) in `star-backend/star_backend_flask/`. Database migrations in `star-backend/database/`. Move root-level backend files to `star-backend/star_backend_flask/`.
- **Config**: Deployment configs in `config/` (e.g., `star-backend/render.yaml`, `config/vercel/vercel.json`, `config/docker/docker-compose.yml`).
- **Tests**: Backend tests in `star-backend/tests/` (e.g., `test_app.py`); frontend tests in `star-frontend/__tests__/*.test.tsx`.

## Developer Workflows

- **Docker Setup (Required)**:
  - Install Docker Desktop on Windows.
  - Run `docker-compose -f config/docker/docker-compose.yml up --build` to start backend, frontend, Redis, and Supabase locally.
- **Backend Setup (Without Docker)**:
  - Navigate to `star-backend/star_backend_flask/`.
  - Run `pip install -r ../requirements.txt`, then `python app.py`.
- **Frontend Setup (Without Docker)**:
  - Navigate to `star-frontend/`.
  - Run `npm install`, then `npm run dev`.
- **Testing**:
  - Backend: `cd star-backend; python -m pytest tests/ -v` (requires Azure Cosmos DB connection).
  - Frontend: `cd star-frontend; npm test` (Jest with `jest.config.js`).
  - AgoraRTC Live Streaming: Use `http://localhost:3000/agora-test` after Docker setup.
- **Debugging**:
  - Backend: Logs to `app.log`. Use Docker logs or check `star-backend/star_backend_flask/app.log`.
  - Frontend: Use Next.js dev tools or VS Code debugger.
- **Deployment**:
  - Backend: `star-backend/render.yaml` deploys to Render; Azure App Service for production.
  - Frontend: `config/vercel/vercel.json` for Vercel. Deploy with `cd star-frontend; vercel deploy --prod`.
  - Local: `docker-compose -f config/docker/docker-compose.yml up --build`.
- **CI/CD**: GitHub Actions in `.github/workflows/` (monorepo setup with separate frontend/backend jobs).

## Conventions

- **Backend**:
  - API endpoints in `star_backend_flask/api.py` use `/api/v1/*` (e.g., `/api/v1/tarot/calculate-energy-flow`).
  - Use `@token_required` from `star_auth.py` for protected routes.
  - Azure Cosmos DB responses: Use `CosmosDBHelper` class methods (e.g., `get_cosmos_helper().query_items()`).
  - Log to `app.log` using `logging` module.
  - Environment variables: `COSMOS_DB_CONNECTION_STRING`, `AGORA_APP_ID`, `REDIS_URL`.
- **Frontend**:
  - TypeScript with strict mode (`tsconfig.json`).
  - API calls via `axios` or `fetch` to `NEXT_PUBLIC_API_URL` (in `.env.local`).
  - 3D components use `@react-three/fiber` and `@react-three/drei`.
  - Live streaming uses `agora-rtc-sdk-ng` and `agora-react-uikit`.
- **Testing**:
  - Backend tests: `star-backend/tests/test_*.py` (pytest with mocks for Cosmos DB).
  - Frontend tests: `star-frontend/__tests__/*.test.tsx` (Jest + React Testing Library).
- **File Naming**: snake_case for Python (e.g., `cosmos_db.py`), camelCase for TypeScript (e.g., `useAuth.ts`).

## Integration Points

- **Azure Cosmos DB**:
  - Configured via `COSMOS_DB_CONNECTION_STRING` in `star-backend/.env`.
  - Use `CosmosDBHelper` class in `cosmos_db.py` for all database operations.
  - Containers: users, posts, tarot_readings, live_streams, etc.
- **AgoraRTC**:
  - App ID and certificate in environment variables.
  - Used for live streaming in `/collaborative-cosmos` and `/agora-test`.
- **Redis**: For caching and session management (configured in Docker).
- **Vercel CLI**:
  - Install: `npm install -g vercel`.
  - Deploy frontend: `cd star-frontend; vercel deploy --prod`.
  - Configure in `config/vercel/vercel.json` for rewrites to `/api/v1/*`.
- **Azure App Service**: Backend deployment with `star-backend/render.yaml`.
- **Docker**: Use `config/docker/docker-compose.yml` for local development with all services.
- **Cross-Component**: Frontend calls `/api/v1/*`; backend handles auth, Cosmos DB queries, and real-time features.

## Gotchas

- **Azure Migration**: Codebase migrated from Supabase to Azure Cosmos DB - use `CosmosDBHelper` instead of Supabase clients.
- **Live Streaming**: AgoraRTC requires valid `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` for testing.
- **3D Cosmos**: React Three Fiber components require proper canvas setup and camera controls.
- **Environment Variables**: Required for Azure, AgoraRTC, Redis - check `.env.example` in backend.
- **Large Files**: Exclude `*.zip`, `*.tar.gz`, `*.exe`, `*.msi`, `*.log`, `jre/` in `.gitignore`. Check with `git status`.
- **Secrets**: Never commit secrets in `render.yaml`, `vercel.json`, or `.env`. Use `ROTATE_SECRETS.md`.
- **Docker**: Required for local Redis, Supabase, and production-like testing. Ensure Docker Desktop is installed.

## Checklist for Contributions

- Move frontend configs (e.g., `next.config.js`) to `star-frontend/`.
- Move backend files to `star-backend/star_backend_flask/` (e.g., `app.py`, `api.py`).
- Use `CosmosDBHelper` for database operations instead of Supabase.
- Run `cd star-backend; python -m pytest tests/ -v` for backend tests.
- Run `cd star-frontend; npm test` for frontend tests.
- Test AgoraRTC features with Docker setup and valid credentials.
- Verify with `docker-compose -f config/docker/docker-compose.yml up --build`.
- Check `app.log` for backend errors.
- Deploy frontend: `cd star-frontend; vercel deploy --prod`.
- Deploy backend: Verify `star-backend/render.yaml` and redeploy on Render/Azure.
- Avoid large files: Update `.gitignore` and check `git status`.
