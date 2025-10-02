from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import posts
from .api.posts import sio
from socketio import ASGIApp

app = FastAPI(title='Star Backend')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'https://star-app.vercel.app'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(posts.router, prefix='/api/v1')

# Mount Socket.IO on /socket.io
app.mount('/socket.io', ASGIApp(sio))
