# Deploying the Star Frontend to Vercel

This guide will walk you through deploying your Star frontend to Vercel, with proper environment variables set for Azure backend integration.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com) if you don't have one)
- Your code pushed to GitHub
- Azure App Service backend deployed and running (see `../DEPLOYMENT_GUIDE.md`)

## Deployment Steps

### 1. Deploy from Terminal

You can deploy directly from the command line using the Vercel CLI:

```bash
# Navigate to the frontend directory
cd star-frontend

# Install the Vercel CLI if you haven't already
npm install -g vercel

# Log in to your Vercel account if needed
vercel login

# Deploy the project (use --prod for production deployment)
vercel --prod
```

### 2. Environment Variables

During deployment, Vercel will use the environment variables from your `.env.local` file. Make sure these variables are correctly set:

- `NEXT_PUBLIC_API_URL` - Your Azure App Service backend URL (e.g., `https://star-backend.azurewebsites.net`)
- `NEXT_PUBLIC_AGORA_APP_ID` - Your Agora App ID (for video streaming)

You can also set these variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add each variable and its value
4. Redeploy your application

### 3. Check Your Deployment

After deployment completes, Vercel will provide a URL for your application (typically `https://star-frontend.vercel.app`). Visit this URL to verify your deployment works correctly.

### 4. Custom Domain (Optional)

To use a custom domain with your application:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add your domain and follow the provided instructions

## Troubleshooting

- If you see CORS errors, make sure your Azure App Service has the correct CORS settings (allow `https://star-frontend.vercel.app`)
- For API connection issues, verify your `NEXT_PUBLIC_API_URL` is correctly pointing to your Azure backend
- For authentication issues, verify your environment variables are correctly set in the Vercel dashboard

## Continuous Deployment

Vercel will automatically deploy new versions when you push changes to your main branch on GitHub. To disable this, go to "Settings" > "Git" in your Vercel project dashboard.
