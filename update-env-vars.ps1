# Update Deployment Environment Variables
# Run this script to update both Vercel and Render environment variables

Write-Host "🚀 Updating Star Platform Deployment Environment Variables" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Vercel Environment Variables
Write-Host "`n📋 VERCEL ENVIRONMENT VARIABLES (Frontend)" -ForegroundColor Yellow
Write-Host "Set these in: https://vercel.com/dashboard -> Your Project -> Settings -> Environment Variables"
Write-Host ""

$vercelVars = @(
    "NEXT_PUBLIC_API_URL=https://star-backend-service.onrender.com"
)

foreach ($var in $vercelVars) {
    Write-Host "  $var" -ForegroundColor Green
}

# Render Environment Variables
Write-Host "`n📋 RENDER ENVIRONMENT VARIABLES (Backend)" -ForegroundColor Yellow
Write-Host "Set these in: https://dashboard.render.com -> Your Service -> Environment"
Write-Host ""

$renderVars = @(
    "SECRET_KEY=your-secure-secret-key-here",
    "JWT_SECRET_KEY=your-jwt-secret-key-here",
    "JWT_ALGORITHM=HS256",
    "COSMOS_ENDPOINT=https://star-cosmos.documents.azure.com:443/",
    "COSMOS_KEY=your-cosmos-key-here",
    "SPOTIFY_CLIENT_ID=dcc37439570a47b1a79db76e3bd35a22",
    "SPOTIFY_CLIENT_SECRET=c2e06d864bca407bab4a6dfbf80993d5",
    "IPGEOLOCATION_API_KEY=ac0f06798ef248d4b2290e1e20e0a2cc",
    "ALLOWED_ORIGINS=http://localhost:3000,https://star-frontend.vercel.app"
)

foreach ($var in $renderVars) {
    Write-Host "  $var" -ForegroundColor Green
}

Write-Host "`n⚠️  IMPORTANT SECURITY NOTES:" -ForegroundColor Red
Write-Host "  • Never commit these values to git"
Write-Host "  • Use the dashboard UI to set these variables"
Write-Host "  • Rotate secrets regularly using ROTATE_SECRETS.md"
Write-Host "  • Test deployments after updating environment variables"

Write-Host "`n✅ NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Copy the variables above to your deployment dashboards"
Write-Host "  2. Redeploy both frontend (Vercel) and backend (Render)"
Write-Host "  3. Test that the application works correctly"
Write-Host "  4. Update local .env files if needed for development"

Write-Host "`n🔗 QUICK LINKS:" -ForegroundColor Magenta
Write-Host "  Vercel Dashboard: https://vercel.com/dashboard"
Write-Host "  Render Dashboard: https://dashboard.render.com"
Write-Host "  Azure Portal: https://portal.azure.com"