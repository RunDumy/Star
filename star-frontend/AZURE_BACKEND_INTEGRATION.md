# Azure Backend Integration Notes# Azure Backend Integration Notes

## Frontend Configuration## Frontend Configuration

The frontend now connects to the Azure App Service backend at:

The frontend now connects to the Azure App Service backend at:```

https://star-app-backend.azurewebsites.net

`text`

https://star-app-backend.azurewebsites.net

```## Environment Variables

1. Local development: Update `.env.local` with `NEXT_PUBLIC_API_URL=https://star-app-backend.azurewebsites.net`

## Environment Variables2. Vercel deployment: Add the environment variable in Vercel dashboard:

   - Settings > Environment Variables

1. Local development: Update `.env.local` with `NEXT_PUBLIC_API_URL=https://star-app-backend.azurewebsites.net`   - Add `NEXT_PUBLIC_API_URL=https://star-app-backend.azurewebsites.net`

2. Vercel deployment: Add the environment variable in Vercel dashboard:

   - Settings > Environment Variables## Testing

   - Add `NEXT_PUBLIC_API_URL=https://star-app-backend.azurewebsites.net`After updating environment variables:

1. Test locally: `npm run dev` from the `star-frontend` directory

## Testing2. Test production build: `npm run build && npm start`

3. Verify all API calls are correctly pointing to the Azure backend

After updating environment variables:

## Troubleshooting

1. Test locally: `npm run dev` from the `star-frontend` directoryIf API requests fail, check:

2. Test production build: `npm run build && npm start`1. Network tab in browser dev tools for CORS errors

3. Verify all API calls are correctly pointing to the Azure backend2. Azure App Service CORS configuration

3. Azure App Service health endpoint: https://star-app-backend.azurewebsites.net/api/health
## Troubleshooting

If API requests fail, check:

1. Network tab in browser dev tools for CORS errors
2. Azure App Service CORS configuration
3. Azure App Service health endpoint: `https://star-app-backend.azurewebsites.net/api/health`
```
