# 🌌 STAR Platform: Azure Deployment Guide

## Overview
The STAR platform is a zodiac-themed social media superplatform with a Next.js + TypeScript frontend and Flask backend. It includes a **Zodiac Arena** Week 3 prototype, a competitive auto-battler with two units (Aries/Fire/red `#ef4444`, Taurus/Earth/brown `#8b4513`) featuring movement, auto-attack (12/8 HP/s), simple AI, unit selection UI, and particle effects, using the cosmic color scheme. Current Git commit: c0267bde.

Features include Cosmic Profiles, Zodiac Moments, Constellation Threads, Planetary Navigation, Infinite Scroll Feed, Zodiac-Specific Actions, Ritual Intelligence Backend, Emotionally Intelligent UX, Badge System, Numerology Integration, Influence Showcase, and Zodiac Arena prototype (accessible at `/zodiac-arena`). Deployed on Azure Static Web Apps (frontend) and Azure App Service (backend).

## 🏗️ Prerequisites
- **Azure Subscription**: ID `bdde7176-08e1-46e6-b5af-ae20abc6b600`, Directory: Newcrowd, Location: Central US.
- **Azure CLI**: Installed and authenticated (`az login`).
- **Git**: Configured with repository (`https://github.com/RunDumy/Star.git`).
- **Docker**: Installed for local testing.
- **PowerShell**: For beginner-friendly commands.
- **Python**: Version 3.14 with `py` command.
- **Node.js**: For frontend scripts and contrast checks.
- **Repository**: Cloned at `C:\Users\fudos\PycharmProjects\Star`.
- **Resources**:
  - Azure App Service: `star-app-backend`
  - Azure Static Web Apps: `star-app-frontend`
  - Azure Cosmos DB: `star-cosmos`

## 🚀 Deployment Steps

### 1. Prepare the Repository
```powershell
Set-Location "C:\Users\fudos\PycharmProjects\Star"
git pull origin main
.\cleanup.ps1
```

### 2. Build and Test Locally
```powershell
Set-Location "C:\Users\fudos\PycharmProjects\Star\star-frontend"
npm install
npm run build
npm run start

Set-Location "C:\Users\fudos\PycharmProjects\Star\star-backend\star_backend_flask"
py -m pip install -r ../requirements_core.txt
py app.py
```

- **Test Zodiac Arena**: Access `http://localhost:3002/zodiac-arena` to verify the game loads and features work (movement, auto-attack, AI, UI, particles).

### 3. Deploy Frontend with Azure Static Web Apps
```powershell
Set-Location "C:\Users\fudos\PycharmProjects\Star\star-frontend"
az staticwebapp deploy --name star-app-frontend --resource-group StarAppGroup --source .
```

### 4. Deploy Backend with Azure App Service
```powershell
Set-Location "C:\Users\fudos\PycharmProjects\Star\star-backend"
az webapp deployment source config-zip --resource-group StarAppGroup --name star-app-backend --src star-backend.zip
```

### 5. Configure Azure Resources
- **Cosmos DB**: Create containers for `profiles`, `social_actions`, `tarot_draws`, etc.
- **WebSocket**: Enable on Azure App Service.
- **Environment Variables**: Set production configs.

## 🔗 Routes
- **Zodiac Arena**: `/zodiac-arena` - Week 3 prototype with auto-attack and AI
- **Cosmic Profiles**: `/` - Default STAR platform feature
- **Other Features**: `/chat`, `/cosmic-feed`, etc.

## 🧪 Testing Checklist
- [x] Create `game` directory under `star-frontend/src/components`
- [x] Implement `ZodiacArenaPrototype.tsx` with Week 3 features
- [ ] Verify `EnhancedPlanetButton.tsx` particle configs
- [ ] Update `universal-space.css` game styles if needed
- [x] Add `/zodiac-arena` route via Next.js page structure
- [x] Build successfully with no conflicts
- [x] Commit and push to Git
- [ ] Deploy to Azure and verify

## 🎯 Next Steps
- **Week 4**: Add win/lose conditions to Zodiac Arena
- **Testing**: Ensure no performance impact (60 FPS, 10-20 particles)
- **Accessibility**: Run `node scripts/check-contrast.js`
- Launch beta and collect playtest feedback

## 📚 References
- [Copilot Instructions](./copilot-instructions.md)
- [API Reference](./API_REFERENCE.md)
- [User Experience Journey](./USER_EXPERIENCE_JOURNEY.md)

---
*Zodiac Arena Week 3 integrated with STAR Platform - Ready for Azure deployment* ✨
