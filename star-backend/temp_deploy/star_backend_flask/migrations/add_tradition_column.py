from flask_migrate import Migrate
from app import app, db

with app.app_context():
    def upgrade():
        db.engine.execute('ALTER TABLE user ADD COLUMN tradition VARCHAR(50)')

    def downgrade():
        db.engine.execute('ALTER TABLE user DROP COLUMN tradition')

    upgrade()
    print("Migration for tradition column applied")
