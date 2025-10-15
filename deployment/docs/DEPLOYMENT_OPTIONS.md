# 🚀 STAR Frontend Deployment Guide (Non-Vercel)

## Option 1: Azure Static Web Apps (Recommended)

### Prerequisites
- Azure account
- Azure CLI installed

### Steps:
1. **Build the frontend**:
   ```bash
   cd star-frontend
   npm run build
   ```

2. **Create Azure Static Web App**:
   ```bash
   # Login to Azure
   az login
   
   # Create resource group (if not exists)
   az group create --name star-frontend-rg --location eastus
   
   # Create static web app
   az staticwebapp create \
     --name star-frontend-app \
     --resource-group star-frontend-rg \
     --source . \
     --location eastus \
     --branch main \
     --app-location "star-frontend" \
     --output-location "out"
   ```

3. **Manual Upload Alternative**:
   - Go to Azure Portal → Static Web Apps
   - Create new Static Web App
   - Upload contents of `star-frontend/out/` folder
   - Configure custom domain if needed

### Configuration Files Created:
- ✅ `staticwebapp.config.json` - Routing and SPA support

---

## Option 2: GitHub Pages

### Steps:
1. **Enable GitHub Pages**:
   - Go to GitHub Repository Settings
   - Pages → Source: Deploy from a branch
   - Branch: `gh-pages` (we'll create this)

2. **Deploy Script**:
   ```bash
   cd star-frontend
   npm run build
   
   # Install gh-pages if not installed
   npm install -g gh-pages
   
   # Deploy to GitHub Pages
   gh-pages -d out -b gh-pages
   ```

3. **Automated GitHub Action** (create `.github/workflows/deploy-pages.yml`):
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install and Build
           run: |
             cd star-frontend
             npm install
             npm run build
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./star-frontend/out
   ```

---

## Option 3: Netlify (Drag & Drop)

### Steps:
1. **Build locally**:
   ```bash
   cd star-frontend
   npm run build
   ```

2. **Deploy manually**:
   - Go to https://netlify.com
   - Drag and drop the `out/` folder
   - Configure custom domain if needed

3. **Configure redirects** (create `star-frontend/out/_redirects`):
   ```
   /api/* https://your-azure-backend.azurewebsites.net/api/:splat 200
   /* /index.html 200
   ```

---

## Option 4: Local Static Server (Testing)

### For Development Testing:
```bash
cd star-frontend
npm run build

# Option A: Using Node.js serve
npx serve out -p 3000

# Option B: Using Python
cd out
python -m http.server 3000

# Option C: Using PHP
cd out
php -S localhost:3000
```

---

## Option 5: Traditional Web Hosting

### Steps:
1. **Build the project**:
   ```bash
   cd star-frontend
   npm run build
   ```

2. **Upload via FTP/SFTP**:
   - Compress the `out/` folder contents
   - Upload to your web hosting provider's public_html or www folder
   - Ensure .htaccess supports SPA routing (for Apache):
   ```apache
   RewriteEngine On
   RewriteRule ^api/(.*)$ https://your-backend-url.com/api/$1 [P,L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

---

## Environment Configuration for Production

### Update API URL:
Before building for production, update `star-frontend/.env.local`:
```bash
# Production API URL
NEXT_PUBLIC_API_URL=https://your-azure-backend.azurewebsites.net

# Remove localhost URL
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Build with production config:
```bash
cd star-frontend
npm run build
```

---

## Post-Deployment Checklist

- [ ] Frontend loads at deployed URL
- [ ] API calls work (check browser console)
- [ ] All pages accessible via direct URL
- [ ] Mobile responsive design works
- [ ] 3D graphics render properly
- [ ] Static assets load correctly

---

## Troubleshooting

### Issue: "404 on page refresh"
**Solution**: Ensure SPA routing is configured:
- Azure Static Web Apps: `staticwebapp.config.json` ✅
- Netlify: `_redirects` file
- GitHub Pages: May need hash routing
- Apache: `.htaccess` with RewriteRules

### Issue: "API calls failing"
**Solutions**:
1. Check CORS configuration in backend
2. Verify API URL in environment variables
3. Ensure backend accepts frontend domain

### Issue: "Build folder missing files"
**Solution**: Always build from `star-frontend/` directory:
```bash
cd star-frontend  # Important!
npm run build
```

---

## Recommended Approach

For your STAR platform, I recommend **Azure Static Web Apps** because:
1. ✅ Integrates well with Azure backend
2. ✅ Built-in CDN and SSL
3. ✅ Custom domain support
4. ✅ Staging environments
5. ✅ Easy API integration

Ready to deploy? Choose your preferred method and I'll help you implement it!