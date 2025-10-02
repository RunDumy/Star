from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import socketio

router = APIRouter()
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=["http://localhost:3000", "https://star-app.vercel.app"])

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def new_post(sid, data):
    print(f"New post received: {data}")
    await sio.emit('post_update', data)

class PostCreate(BaseModel):
    content: str
    zodiac_sign: str
    username: str

@router.get("/posts")
async def get_posts():
    return {"items": []}  # Placeholder for database integration

@router.post("/posts")
async def create_post(post: PostCreate):
    try:
        post_data = {
            "id": 1,  # Placeholder ID
            "username": post.username,
            "zodiac_sign": post.zodiac_sign,
            "content": post.content,
            "image_url": None,
            "created_at": datetime.now().isoformat()
        }
        await sio.emit('post_update', post_data)
        return post_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating post: {str(e)}")