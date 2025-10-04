# Local development with Docker (STAR)

This guide explains how to run the STAR monorepo locally in a production-like environment using Docker and the Supabase CLI emulation.

Prerequisites

- Docker Desktop (Windows)
- Node.js 16+
- Python 3.8+
- Git

Files added/used

- `config/docker/docker-compose.dev.yml` — Docker compose for backend, frontend, and Supabase CLI emulation.
- `config/docker/.env.dev.example` — example env file with placeholders.
- `config/docker/.env.dev` — auto-generated local env file (DO NOT commit).
- `star-backend/Dockerfile`, `star-frontend/Dockerfile` — Dockerfiles used by compose.
- `consolidate-backend.ps1` — consolidation script (Docker-first).

Quick start

1. Ensure Docker Desktop is running.
2. Copy the example env file and edit secrets (if needed):

```pwsh
cd C:\Users\fudos\PycharmProjects\Star\config\docker
copy .env.dev.example .env.dev
notepad .env.dev
```

3. Start the stack (this will build backend/frontend images and start the Supabase CLI emulation):

```pwsh
cd C:\Users\fudos\PycharmProjects\Star
docker compose -f config/docker/docker-compose.dev.yml up --build
```

4. Wait for Supabase to be healthy. The compose file uses a healthcheck; backend waits for Supabase readiness before starting.

5. Run backend tests from another terminal (activate venv if using one):

```pwsh
cd C:\Users\fudos\PycharmProjects\Star
# optional: activate venv
.\.venv\Scripts\Activate.ps1
pip install -r star-backend/requirements.txt
pip install pytest
pytest -q
```

Troubleshooting

- Supabase CLI fails to start in the container:
  - Ensure Docker has enough resources (memory/CPU). Supabase emulation can be resource intensive.
  - Check container logs:
    ```pwsh
    docker compose -f config/docker/docker-compose.dev.yml logs supabase-cli
    ```
- Backend can't connect to Supabase:
  - Confirm `SUPABASE_URL` in `config/docker/.env.dev` points to `http://supabase:3000` (the service inside compose) or `http://localhost:3000` if running Supabase locally.
  - If running Supabase CLI on host instead of in compose, set `SUPABASE_URL=http://host.docker.internal:3000` for containers on Windows.
- Tests failing with auth errors:
  - Ensure `SUPABASE_ANON_KEY` in `.env.dev` matches the local Supabase project's anon key (printed by `supabase start`).

Notes

- The `.env.dev` file is generated and should NOT be committed. Use environment secret management for CI.
- If you prefer the Supabase CLI on host instead of in Docker, run `supabase start` in `star-backend` and set `SUPABASE_URL=http://host.docker.internal:3000` in `.env.dev`.

If you'd like, I can add a simple health-check script that polls `http://localhost:3000` and exits successfully when Supabase returns OK. Let me know if you want that.
