# Star App Frontend

A minimal, beginner-friendly Next.js frontend for the Star App with a starry background, twinkling stars, and a comet. Connects to the Flask backend on Azure App Service.

## Quick Start

1. npm install
2. Create .env.local with:
   NEXT_PUBLIC_API_URL=https://your-azure-app-service.azurewebsites.net
3. npm run dev
4. Open http://localhost:3000

## Features

- Starry background with tsparticles + comet animation
- Pages: Home (feed), Login, Register, Zodiac Numbers
- Axios helper with JWT Authorization header
- Input sanitization via DOMPurify

## Deployment

Deploy the frontend to any static hosting provider that supports Next.js. Configure the environment variable NEXT_PUBLIC_API_URL to point to your Azure App Service backend.

Tip: Compress public images and keep particles count low for best performance on free plans.

## Licenses

This project uses the following open-source packages:

- **react**: MIT License - React framework
- **next**: MIT License - Next.js framework
- **@react-three/fiber**: MIT License - React Three Fiber for 3D rendering
- **tsparticles**: MIT License - Particle effects library

All dependencies are compatible and licensed under permissive open-source licenses (MIT, ISC, BSD, Apache-2.0). No GPL or restrictive licenses are used.
