# Copilot Instructions for STAR Monorepo

## Overview

STAR is a zodiac-themed social media platform with a 3D cosmic interface, real-time chat, Spotify music integration, and a dynamic feed, inspired by Facebook, Instagram, and TikTok. It uses:

- **Frontend**: Next.js + TypeScript (`star-frontend/`) with React Three Fiber for 3D UI
- **Backend**: Flask (`star-backend/star_backend_flask/`, production, entry: `app.py`) with Flask-SocketIO for real-time chat, and experimental FastAPI (`star-backend/main.py`)
- **Database**: Supabase (Postgres, with Row Level Security, Realtime enabled)
- **Local Dev**: Docker Compose for backend, frontend, and Supabase
- **Deployment**: Render (backend, WebSocket-enabled), Vercel (frontend)
- **Testing**: Jest (frontend), pytest (backend, stabilized with mocks), GitHub Actions for CI/CD
- **Spotify Integration**: PKCE OAuth for user authentication, displaying top tracks, currently playing, and zodiac-themed recommendations; track sharing in chat and feed
- **Dynamic Feed**: User-generated posts with text, Spotify track embeds, likes, and comments; real-time updates via Supabase Realtime

## Architecture & Data Flow

- **Frontend** (`star-frontend/`): Next.js app. Key dirs: `pages/` (routes, e.g., `/home`, `/chat`, `/music`, `/feed`), `components/` (e.g., `CosmicInterface.tsx` for 3D homepage, `ZodiacChatRooms.tsx` for chat, `SpotifyStats.tsx` for music stats), `lib/` (Supabase client), `hooks/`, `utils/`. Configs: `next.config.js`, `package.json`, `tsconfig.json`, `jest.config.js`.
- **Backend** (`star-backend/star_backend_flask/`): Flask app (`star-backend/star_backend_flask/`). Main files: `app.py` (entry with SocketIO), `api.py` (REST endpoints, including `/api/v1/spotify/token`, `/api/v1/posts`), `group_chat.py` (SocketIO chat), `star_auth.py` (auth), `requirements.txt`. Experimental FastAPI in `star-backend/main.py`.
- **Database**: Supabase for auth, profiles (with `zodiac_sign`, Spotify tokens), chat data (`chat_messages`, `private_rooms`, `private_room_reads`), and feed (`posts`, `likes`, `comments`). Schema: `star-backend/database/supabase_schema.sql`.
- **Data flow**: Frontend calls `/api/v1/*` (e.g., `/posts`, `/chat/*`), connects via SocketIO to `NEXT_PUBLIC_API_URL` base. Clients emit `identify` for chat. Spotify PKCE OAuth handled via `/api/auth/spotify`. Feed updates via Supabase Realtime.
- **Auth**: Supabase auth with `useAuth` hook (`lib/supabase.ts`). Backend uses `@token_required` with RLS. Spotify auth via PKCE, tokens stored in `profiles`. JWT secret in `app.config['JWT_SECRET_KEY']`.

## Chat System Architecture

- **Public Rooms**: Zodiac-themed group chat rooms restricted to zodiac signs (e.g., Fire signs: Aries, Leo, Sagittarius)
- **Private Rooms**: User-to-user private messaging with RLS security policies
- **User Search**: Searchable input for finding users by username or email to start private chats, with debounced API calls to `/api/v1/chat/search-users`
- **Real-time Communication**: Flask-SocketIO for instant messaging, typing indicators, and room management
- **Security**: Row Level Security (RLS) ensures only authorized users can access private room messages
- **Notifications**: Real-time push notifications for new messages and private chats

## Environment Setup

- **Prerequisites**: Python 3.11+, Node 18+, Docker Desktop, Tailwind CSS, Three.js, Spotify Developer account. Copy `.env` templates from `ENV_VARS_TEMPLATE.md` to `star-frontend/.env.local`, `star-backend/.env`, `config/docker/.env.dev`. Add `cosmic-chime.mp3` to `star-frontend/public/sounds/`.
- **Secrets**: Never commit secrets. Use `ENV_VARS_TEMPLATE.md` and project docs to find which vars belong in Vercel/Render.
- **Spotify Setup**: Create app at Spotify Developer Dashboard, set redirect URI to `http://localhost:3000/api/auth/callback/spotify` (local) or production URL.

## Developer Workflows

- **Local Dev (Docker, required for Supabase):**
  - `docker-compose -f config/docker/docker-compose.yml up --build`
- **Frontend (manual):**
  - `cd star-frontend && npm install && npm run dev`
- **Backend (manual):**
  - Flask: `cd star-backend/star_backend_flask && pip install -r requirements.txt && flask run`
  - FastAPI: `cd star-backend && pip install -r requirements.txt && uvicorn main:app --reload`
- **Testing:**
  - Backend: `cd star-backend && python -m venv venv && source venv/bin/activate && pip install pytest pytest-mock && pytest tests/test_feed.py`
  - Frontend: `cd star-frontend && npm test`
- **Debugging:**
  - Backend: Check `star-backend/app.log`. Tail: `docker-compose logs -f backend`. Common issues: Supabase "ConnectionError", SocketIO failures (port 5000), Spotify token errors.
  - Frontend: Use Next.js dev tools, check console for SocketIO, WebGL, or Spotify API errors.
- **Deployment:**
  - Backend: `star-backend/render.yaml` (Render, `gunicorn --chdir star-backend/star_backend_flask app:app`)
  - Frontend: `star-frontend/vercel.json` (`vercel deploy --prod`)

## Conventions & Patterns

- **API endpoints:** REST in `api.py` (`/api/v1/*`, e.g., `/posts`, `/posts/<id>/like`, `/posts/<id>/comment`), SocketIO in `group_chat.py`.
- **Supabase:** Config in `star-backend/.env`. Schema: Apply with `supabase db push`. Realtime enabled for `chat_messages`, `private_rooms`, `posts`, `likes`, `comments`.
- **Frontend API calls:** Use `fetch` to `NEXT_PUBLIC_API_URL`, `socket.io-client` for chat, `spotify-web-api-node` for music.
- **UI**: 3D homepage (`CosmicInterface.tsx`), chat UI (`ZodiacChatRooms.tsx`), feed (`feed/page.tsx`) with Spotify embeds, music stats (`SpotifyStats.tsx`), recommendations (`/music`).
- **Testing:** Backend: `tests/test_*.py` (pytest, mocks Supabase). Frontend: `__tests__/*.test.tsx` (Jest).
- **Naming:** Python: snake_case; TypeScript: camelCase
- **Styling:** Tailwind CSS for 2D UI, React Three Fiber for 3D.

## Integration Points

- **Supabase**: Manages auth, profiles, chat, and feed data. Access via `supabase-py` (backend), `@supabase/supabase-js` (frontend).
- **SocketIO**: Clients emit `identify` for chat. Server emits `new_private_room`, `new_message`.
- **Spotify**: PKCE OAuth via `/api/auth/spotify`, token exchange via `/api/v1/spotify/token`. Stats and embeds in `SpotifyStats.tsx`, `feed/page.tsx`, `ZodiacChatRooms.tsx`.
- **Feed**: Posts/total posts, likes, comments via `/api/v1/posts`, `/posts/<id>/like`, `/posts/<id>/comment`.
- **Docker**: `config/docker/docker-compose.yml` for local dev.
- **Render**: `star-backend/render.yaml` (WebSocket-enabled).
- **Vercel**: `star-frontend/vercel.json`.

## Gotchas & Project-Specific Notes

- Canonical backend: `star-backend/star_backend_flask/` (entry: `app.py`).
- Exclude large files in `.gitignore` (e.g., `jre.zip`).
- Supabase requires Docker for tests: `docker-compose up -d`.
- Logs: Use `star-backend/app.log`.
- SocketIO: `group_chat.py` handles chat, notifications.
- Spotify: Ensure `SPOTIFY_CLIENT_ID`, `SPOTIFY_REDIRECT_URI` are set.
- Feed: Constellation images (`/constellations/*.png`) or CSS gradients for zodiac theming.
- 3D UI: Pulsating buttons, sparkles, sound effects (`cosmic-chime.mp3`).

## Key Files & Directories

- `README.md`, `config/docker/docker-compose.yml`
- `star-frontend/`: `pages/` (`home`, `chat`, `music`, `feed`), `components/` (`CosmicInterface.tsx`, `ZodiacChatRooms.tsx`, `SpotifyStats.tsx`), `lib/supabase.ts`
- `star-backend/star_backend_flask/`: `app.py`, `group_chat.py`, `api.py`
- `star-backend/database/supabase_schema.sql`
- `star-backend/tests/`, `star-backend/render.yaml`, `star-frontend/vercel.json`
- `docs/copilot-instructions.md`
- **Debugging:**
  - Backend: Check `star-backend/app.log`. Tail logs in Docker: `docker-compose logs -f backend`. Common issues: Supabase "ConnectionError" (check `SUPABASE_URL`, `SUPABASE_KEY` in `star-backend/.env`).
  - Frontend: Use Next.js dev tools, VS Code debugger.
- **Deployment:**
  - Backend: `star-backend/render.yaml` (Render, runs `gunicorn --chdir star-backend/star_backend_flask app:app`). Configure Render dashboard with `SUPABASE_URL`, `SUPABASE_KEY`.
  - Frontend: `star-frontend/vercel.json` (Vercel, `vercel deploy --prod`). Set `NEXT_PUBLIC_API_URL` in Vercel environment settings.
- **CI/CD:**
  - GitHub Actions in `.github/workflows/`

## Conventions & Patterns

- **API endpoints:** All in `star-backend/star_backend_flask/api.py` as `/api/*`
- **Supabase:** Config: `SUPABASE_URL`, `SUPABASE_KEY` in `star-backend/.env`. Schema: Apply with `supabase db push` via Docker.
- **Frontend API calls:** Use `fetch` to `NEXT_PUBLIC_API_URL` (set in `star-frontend/.env.local`)
- **Testing:** Backend: `star-backend/tests/test_*.py` (pytest, mocks Supabase where needed). Frontend: `star-frontend/__tests__/*.test.tsx` (Jest).
- **Naming:** Python: snake_case; TypeScript: camelCase
- **Logging:** Backend logs to `star-backend/app.log` via `logging` module

## Integration Points

- **Supabase:** Persistent data storage via `supabase-py`. Schema in `star-backend/database/`. No separate `supabase/` directory. Configure via Supabase dashboard and `star-backend/.env`.
- **Docker:** Required for local Supabase and full-stack dev. Compose file: `config/docker/docker-compose.yml`.
- **Render:** Backend deploy config: `star-backend/render.yaml`
- **Vercel:** Frontend deploy config: `star-frontend/vercel.json`

## Gotchas & Project-Specific Notes

- **Canonical backend is `star-backend/`**. No `star-backend/star_backend/` or `backend/` directories exist; all Flask files are in `star-backend/star_backend_flask/` (entry: `app.py`).
- **Large files:** Exclude binaries, logs, archives in `.gitignore` (e.g., `jre.zip`, `render-cli.tar.gz`).
- **Supabase must run via Docker for tests to pass.** Use `docker-compose up` before running `pytest`.
- **Logs**: Only use `star-backend/app.log` for backend logging; avoid root-level logs.
- **Main entry points**: Use `star-backend/star_backend_flask/app.py` for Flask (production) and `star-backend/main.py` for FastAPI (experimental).

## Key Files & Directories

- Start here: `README.md` (overview), `config/docker/docker-compose.yml` (setup)
- `star-frontend/`: Next.js app, configs, tests
- `star-backend/star_backend_flask/`: Flask app, API, auth (entry: `app.py`)
- `star-backend/main.py`: Experimental FastAPI backend
- `star-backend/database/`: Supabase schema
- `star-backend/tests/`: Backend test suites
- `config/docker/docker-compose.yml`: Local dev stack
- `star-backend/render.yaml`, `star-frontend/vercel.json`: Deployment configs
- `docs/copilot-instructions.md`: This file
