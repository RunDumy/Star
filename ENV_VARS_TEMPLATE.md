ENV Vars Template — Vercel & Render
=================================

This file lists the environment variables required by the project and where to set them.

IMPORTANT: Do not commit real secret values to git. Use the dashboard (Vercel/Render) to store them.

Frontend (Vercel) - set in Vercel Dashboard → Project → Settings → Environment Variables

- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Backend (Render) - set in Render Dashboard → Service → Environment

- SECRET_KEY
- JWT_SECRET_KEY
- JWT_ALGORITHM (e.g., HS256)
- DATABASE_URL
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET
- IPGEOLOCATION_API_KEY
- ALLOWED_ORIGINS (comma-separated)
- PORT (Render provides its own PORT, override only if required)

Example notes:

- For Vercel, public keys used by the frontend must be prefixed with `NEXT_PUBLIC_`. Private keys belong in Render/Vercel project settings (NOT in code).
