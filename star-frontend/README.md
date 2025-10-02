# Star App Frontend

A minimal, beginner-friendly Next.js frontend for the Star App with a starry background, twinkling stars, and a comet. Deploy on Vercel and connect to the Flask backend on Render.

## Quick Start

1. npm install
2. Create .env.local with:
   NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
3. npm run dev
4. Open http://localhost:3000

## Features

- Starry background with tsparticles + comet animation
- Pages: Home (feed), Login, Register, Zodiac Numbers
- Axios helper with JWT Authorization header
- Input sanitization via DOMPurify

## Deploy to Vercel

- Push this folder as a repo
- Import repo in Vercel
- Add env var NEXT_PUBLIC_API_URL
- Deploy

Tip: Compress public images and keep particles count low for best performance on free plans.
