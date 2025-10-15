# ROTATE SECRETS & UPDATE DEPLOYMENTS

This document contains step-by-step, copyable commands and UI guidance to rotate exposed secrets (Azure Cosmos DB, Spotify) and update deployment dashboards (Azure App Service). It deliberately does NOT contain any secret values — paste your new secrets into the places marked `<new-...>`.

## 1) Azure Cosmos DB (Connection String + Keys)

### UI (Azure Portal - recommended)

1. Visit the Azure portal: [https://portal.azure.com](https://portal.azure.com) and open your Cosmos DB account.
2. Go to Settings → Keys. Click **Regenerate** for the primary key and secondary key if needed.
3. Save the new keys in your password manager.

### CLI (Azure CLI - optional)

```bash
az cosmosdb keys regenerate --name <COSMOS_DB_ACCOUNT> --resource-group <RESOURCE_GROUP> --key-kind primary
```

### Update local .env (Azure Cosmos DB - never commit)

```powershell
notepad .\star-backend\star_backend_flask\.env
# COSMOS_DB_ENDPOINT=https://<account>.documents.azure.com:443/
# COSMOS_DB_KEY=<new-primary-key>
# COSMOS_DB_DATABASE=<database-name>
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

## 3) Azure Cosmos DB Connection (Primary Key)

### UI (Azure Portal - DB)

1. Cosmos DB Account → Settings → Keys → Regenerate Primary Key.
2. Copy the new primary key and update connection strings accordingly.

### Update local .env (Azure Cosmos DB)

```powershell
notepad .\star-backend\star_backend_flask\.env
# COSMOS_DB_KEY=<new-primary-key>
```

## 4) Update Azure App Service (backend) env vars

### UI (Azure Portal)

1. Open the Azure portal: [https://portal.azure.com](https://portal.azure.com) and select your App Service.
2. Go to Settings → Configuration → Application settings. Add/Update keys: `COSMOS_DB_ENDPOINT`, `COSMOS_DB_KEY`, `COSMOS_DB_DATABASE`, `SPOTIFY_CLIENT_SECRET`, `IPGEOLOCATION_API_KEY`, `JWT_SECRET_KEY`.
3. Save and the app will restart automatically.

### CLI (Azure CLI example)

```bash
# Example (adapt to your CLI tooling)
az webapp config appsettings set --name <APP_SERVICE_NAME> --resource-group <RESOURCE_GROUP> --setting COSMOS_DB_KEY=<new-key>
az webapp restart --name <APP_SERVICE_NAME> --resource-group <RESOURCE_GROUP>
```

## 5) Update Frontend Deployment (environment variables)

### UI (Your Hosting Provider)

1. Access your hosting provider's dashboard (Azure Static Web Apps, Netlify, etc.)
2. Navigate to Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with the new backend URL
4. Trigger a redeploy

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

- Check Azure App Service logs for backend startup and Cosmos DB connection messages.
- Check frontend deployment logs and test frontend flows that use the API.

## 7) Revoke old keys

- Spotify: regeneration invalidates old keys. For other providers, explicitly revoke or delete old keys where supported.

## 8) Notes

- Never commit `.env` or secret values to git.
- If secrets were pushed to a remote, consider history rewrite (BFG/git-filter-repo) — see `BFG_REWRITE_PLAN.md`.
