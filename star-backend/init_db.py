import os
from app import app, db

print(f"SUPABASE_URL: {os.getenv('SUPABASE_URL')}")
print(f"SUPABASE_KEY: {os.getenv('SUPABASE_KEY')}")

with app.app_context():
    db.create_all()
    print("DB tables created")
