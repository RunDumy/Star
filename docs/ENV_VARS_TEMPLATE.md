# ENV Vars Template — Azure Deployment

This file lists the environment variables required by the project and where to set them.

IMPORTANT: Do not commit real secret values to git. Use the Azure App Service configuration or your hosting provider's dashboard to store them.

Frontend - set in your hosting provider's dashboard or environment configuration:

- NEXT_PUBLIC_API_URL

Backend (Azure App Service) - set in Azure Portal → App Service → Configuration → Application Settings

- SECRET_KEY
- JWT_SECRET_KEY
- JWT_ALGORITHM (e.g., HS256)
- DATABASE_URL
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET
- IPGEOLOCATION_API_KEY
- ALLOWED_ORIGINS (comma-separated)
- REDIS_URL
- PORT (Render provides its own PORT, override only if required)

Example notes:

- For Vercel, public keys used by the frontend must be prefixed with `NEXT_PUBLIC_`. Private keys belong in Render/Vercel project settings (NOT in code).
