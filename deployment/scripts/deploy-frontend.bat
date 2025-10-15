@echo off
echo 🚀 STAR Frontend Deployment Script
echo.

cd /d "C:\Users\fudos\PycharmProjects\Star\star-frontend"

echo ✅ Building Next.js application...
npm run build

if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo 📁 Static files are in: star-frontend/out/
echo.
echo 🌐 Deployment Options:
echo 1. Azure Static Web Apps: Upload contents of 'out' folder
echo 2. GitHub Pages: Run 'gh-pages -d out'  
echo 3. Netlify: Drag and drop 'out' folder to netlify.com
echo 4. Any static hosting: Upload 'out' folder contents
echo.
echo 🧪 Test locally with: npx serve out -p 3000
echo.
pause