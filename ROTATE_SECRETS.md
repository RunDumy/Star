# ROTATE SECRETS & UPDATE DEPLOYMENTS

This document contains step-by-step, copyable commands and UI guidance to rotate exposed secrets (Supabase, Spotify, Database) and update deployment dashboards (Render, Vercel). It deliberately does NOT contain any secret values — paste your new secrets into the places marked `<new-...>`.

## 1) Supabase (Anon + Service Role)

### UI (Supabase - recommended)

1. Visit the Supabase console: [https://app.supabase.com](https://app.supabase.com) and open your project.
2. Go to Settings → API. Click **Regenerate** for the anon key and the service_role key.
3. Save the new keys in your password manager.

### CLI (Supabase - optional)

```bash
npm install -g @supabase/cli
supabase projects api-keys regenerate --project-ref <PROJECT_REF> --key-type anon
supabase projects api-keys regenerate --project-ref <PROJECT_REF> --key-type service_role
```

### Update local .env (Supabase - never commit)

```powershell
notepad .\star-backend\star_backend_flask\.env
# SUPABASE_URL=https://<project>.supabase.co
# SUPABASE_ANON_KEY=<new-anon-key>
# SUPABASE_SERVICE_ROLE_KEY=<new-service-role-key>
```

## 2) Spotify (Client Secret)

### UI (Spotify)

1. Visit the Spotify Developer Dashboard: [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and open your app.
2. Click **Show Client Secret** → **Regenerate Secret**.
3. Store the new secret securely.

### Update local .env (Spotify)

```powershell
notepad .\star-backend\star_backend_flask\.env
# SPOTIFY_CLIENT_SECRET=<new-secret>
```

## 3) Postgres password (Supabase-managed DB)

### UI (Supabase - DB)

1. Project → Settings → Database → Reset database password.
2. Copy the new password and update `DATABASE_URL` accordingly.

### Update local .env (Postgres)

```powershell
notepad .\star-backend\star_backend_flask\.env
# DATABASE_URL=postgresql://postgres:<new-password>@db.<project-ref>.supabase.co:5432/postgres
```

## 4) Update Render (backend) env vars

### UI (Render)

1. Open the Render dashboard: [https://dashboard.render.com](https://dashboard.render.com) and select your service (e.g. `star-backend-web` or `star-backend-service`).
2. Go to Environment → Add/Update keys: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `SPOTIFY_CLIENT_SECRET`, `IPGEOLOCATION_API_KEY`, `JWT_SECRET_KEY`.
3. Save and click **Deploy Latest** (or push a commit to trigger deployment).

### CLI (Render example)

```bash
# Example (adapt to your CLI tooling)
render env set --service <SERVICE_ID> --key SUPABASE_ANON_KEY --value <new-anon-key>
render env set --service <SERVICE_ID> --key SUPABASE_SERVICE_ROLE_KEY --value <new-service-key>
render deploy --service <SERVICE_ID>
```

## 5) Update Vercel (frontend) env vars

### UI (Vercel)

1. Open Vercel: [https://vercel.com](https://vercel.com) → Projects → your project → Settings → Environment Variables.
2. Update `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BACKEND_URL`.
3. Trigger a redeploy.

### CLI (Vercel)

```bash
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY <new-anon-key> production
vercel --prod
```

## 6) Verification

### Local backend verification (dev)

```powershell
cd star-backend
.\.venv\Scripts\Activate.ps1
# ensure .env contains new keys
python star_backend_flask\app.py
# Test endpoint
curl http://localhost:5000/api/example
```

### Deployed verification (prod)

- Check Render logs for backend startup and Supabase connection messages.
- Check Vercel deployment logs and test frontend flows that use Supabase.

## 7) Revoke old keys

- Supabase/Spotify: regeneration invalidates old keys. For other providers, explicitly revoke or delete old keys where supported.

## 8) Notes

- Never commit `.env` or secret values to git.
- If secrets were pushed to a remote, consider history rewrite (BFG/git-filter-repo) — see `BFG_REWRITE_PLAN.md`.
