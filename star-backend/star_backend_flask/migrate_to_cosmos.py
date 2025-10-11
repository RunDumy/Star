#!/usr/bin/env python3
"""
Data Migration Script: Migrate from SQLAlchemy (PostgreSQL/SQLite) to Azure Cosmos DB

This script migrates all data from the existing SQLAlchemy database to Cosmos DB
as part of the complete migration to Cosmos DB for consistency.

Usage:
    python migrate_to_cosmos.py [--dry-run] [--batch-size BATCH_SIZE]

Options:
    --dry-run       Show what would be migrated without actually doing it
    --batch-size    Number of items to process in each batch (default: 100)
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import argparse

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from flask import Flask
    from flask_sqlalchemy import SQLAlchemy
    from cosmos_db import get_cosmos_helper
    import uuid
except ImportError as e:
    print(f"Error importing required modules: {e}")
    print("Make sure you're running this from the star-backend/star_backend_flask directory")
    sys.exit(1)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('migration.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DataMigration:
    """Handles migration from SQLAlchemy to Cosmos DB"""

    def __init__(self, dry_run: bool = False, batch_size: int = 100):
        self.dry_run = dry_run
        self.batch_size = batch_size
        self.cosmos_helper = get_cosmos_helper()
        self.db = None
        self.stats = {
            'posts': 0,
            'comments': 0,
            'follows': 0,
            'sparks': 0,
            'users': 0,
            'errors': 0
        }

    def init_sqlalchemy(self):
        """Initialize SQLAlchemy connection"""
        try:
            app = Flask(__name__)
            database_url = os.environ.get('DATABASE_URL', 'sqlite:///test.db').replace('postgres://', 'postgresql+psycopg2://').replace('postgresql://', 'postgresql+psycopg2://')
            app.config['SQLALCHEMY_DATABASE_URI'] = database_url
            app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

            db = SQLAlchemy(app)
            self.db = db

            # Define models (copied from app.py)
            class User(db.Model):
                __tablename__ = 'user'
                id = db.Column(db.Integer, primary_key=True)
                username = db.Column(db.String(50), unique=True, nullable=False)
                password_hash = db.Column(db.String(128), nullable=False)
                zodiac_sign = db.Column(db.String(20), nullable=False)
                birth_date = db.Column(db.Date, nullable=True)
                birth_time = db.Column(db.Time, nullable=True)
                birth_city = db.Column(db.String(100), nullable=True)
                chinese_zodiac = db.Column(db.String(20), nullable=True)
                chinese_element = db.Column(db.String(20), nullable=True)
                vedic_zodiac = db.Column(db.String(20), nullable=True)
                created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

            class Post(db.Model):
                __tablename__ = 'post'
                id = db.Column(db.Integer, primary_key=True)
                content = db.Column(db.Text, nullable=False)
                user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
                zodiac_sign = db.Column(db.String(20), nullable=False)
                is_trend_hijack = db.Column(db.Boolean, default=False)
                trend_category = db.Column(db.String(50))
                image_url = db.Column(db.String(255), nullable=True)
                spark_count = db.Column(db.Integer, default=0)
                echo_count = db.Column(db.Integer, default=0)
                created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
                author = db.relationship('User', backref='posts')

            class Follow(db.Model):
                __tablename__ = 'follow'
                id = db.Column(db.Integer, primary_key=True)
                follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
                followed_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
                created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

            class Spark(db.Model):
                __tablename__ = 'spark'
                id = db.Column(db.Integer, primary_key=True)
                user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
                post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
                created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

            class Comment(db.Model):
                __tablename__ = 'comment'
                id = db.Column(db.Integer, primary_key=True)
                content = db.Column(db.Text, nullable=False)
                user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
                post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
                zodiac_sign = db.Column(db.String(20), nullable=False)
                created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

            self.User = User
            self.Post = Post
            self.Follow = Follow
            self.Spark = Spark
            self.Comment = Comment

            with app.app_context():
                db.create_all()

            logger.info(f"Connected to SQLAlchemy database: {database_url}")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize SQLAlchemy: {e}")
            return False

    def migrate_users(self):
        """Migrate users from SQLAlchemy to Cosmos DB"""
        logger.info("Starting user migration...")

        with self.db.session.begin():
            users = self.db.session.query(self.User).all()

            for user in users:
                try:
                    # Transform to Cosmos DB format
                    cosmos_user = {
                        'id': str(user.id),  # Use string ID for Cosmos DB
                        'username': user.username,
                        'password_hash': user.password_hash,
                        'zodiac_sign': user.zodiac_sign,
                        'birth_date': user.birth_date.isoformat() if user.birth_date else None,
                        'birth_time': user.birth_time.strftime('%H:%M:%S') if user.birth_time else None,
                        'birth_city': user.birth_city,
                        'chinese_zodiac': user.chinese_zodiac,
                        'chinese_element': user.chinese_element,
                        'vedic_zodiac': user.vedic_zodiac,
                        'created_at': user.created_at.isoformat() if user.created_at else datetime.now(timezone.utc).isoformat(),
                        'type': 'user'
                    }

                    if not self.dry_run:
                        result = self.cosmos_helper.create_user(cosmos_user)
                        if result.get('error'):
                            logger.error(f"Failed to create user {user.username}: {result['error']}")
                            self.stats['errors'] += 1
                        else:
                            logger.info(f"Created user: {user.username}")
                            self.stats['users'] += 1
                    else:
                        logger.info(f"Would create user: {user.username}")
                        self.stats['users'] += 1

                except Exception as e:
                    logger.error(f"Error migrating user {user.username}: {e}")
                    self.stats['errors'] += 1

    def migrate_posts(self):
        """Migrate posts from SQLAlchemy to Cosmos DB"""
        logger.info("Starting post migration...")

        with self.db.session.begin():
            posts = self.db.session.query(self.Post).all()

            for post in posts:
                try:
                    # Get username from user_id
                    user = self.db.session.query(self.User).filter_by(id=post.user_id).first()
                    username = user.username if user else f"user_{post.user_id}"

                    # Transform to Cosmos DB format
                    cosmos_post = {
                        'id': str(post.id),
                        'user_id': str(post.user_id),
                        'username': username,
                        'content': post.content,
                        'zodiac_sign': post.zodiac_sign,
                        'is_trend_hijack': post.is_trend_hijack,
                        'trend_category': post.trend_category,
                        'image_url': post.image_url,
                        'spark_count': post.spark_count,
                        'echo_count': post.echo_count,
                        'created_at': post.created_at.isoformat() if post.created_at else datetime.now(timezone.utc).isoformat(),
                        'type': 'post'
                    }

                    if not self.dry_run:
                        result = self.cosmos_helper.create_post(cosmos_post)
                        if not result:
                            logger.error(f"Failed to create post {post.id}")
                            self.stats['errors'] += 1
                        else:
                            logger.info(f"Created post: {post.id}")
                            self.stats['posts'] += 1
                    else:
                        logger.info(f"Would create post: {post.id}")
                        self.stats['posts'] += 1

                except Exception as e:
                    logger.error(f"Error migrating post {post.id}: {e}")
                    self.stats['errors'] += 1

    def migrate_follows(self):
        """Migrate follows from SQLAlchemy to Cosmos DB"""
        logger.info("Starting follow migration...")

        with self.db.session.begin():
            follows = self.db.session.query(self.Follow).all()

            for follow in follows:
                try:
                    # Get usernames
                    follower = self.db.session.query(self.User).filter_by(id=follow.follower_id).first()
                    followed = self.db.session.query(self.User).filter_by(id=follow.followed_id).first()

                    follower_username = follower.username if follower else f"user_{follow.follower_id}"
                    followed_username = followed.username if followed else f"user_{follow.followed_id}"

                    # Transform to Cosmos DB format
                    cosmos_follow = {
                        'id': str(uuid.uuid4()),
                        'follower_id': str(follow.follower_id),
                        'followed_id': str(follow.followed_id),
                        'follower_username': follower_username,
                        'followed_username': followed_username,
                        'created_at': follow.created_at.isoformat() if follow.created_at else datetime.now(timezone.utc).isoformat(),
                        'type': 'follow'
                    }

                    if not self.dry_run:
                        result = self.cosmos_helper.create_follow(cosmos_follow)
                        if not result:
                            logger.error(f"Failed to create follow relationship {follow.id}")
                            self.stats['errors'] += 1
                        else:
                            logger.info(f"Created follow: {follower_username} -> {followed_username}")
                            self.stats['follows'] += 1
                    else:
                        logger.info(f"Would create follow: {follower_username} -> {followed_username}")
                        self.stats['follows'] += 1

                except Exception as e:
                    logger.error(f"Error migrating follow {follow.id}: {e}")
                    self.stats['errors'] += 1

    def migrate_sparks(self):
        """Migrate sparks (likes) from SQLAlchemy to Cosmos DB"""
        logger.info("Starting spark migration...")

        with self.db.session.begin():
            sparks = self.db.session.query(self.Spark).all()

            for spark in sparks:
                try:
                    # Transform to Cosmos DB format
                    cosmos_spark = {
                        'id': str(uuid.uuid4()),
                        'user_id': str(spark.user_id),
                        'post_id': str(spark.post_id),
                        'created_at': spark.created_at.isoformat() if spark.created_at else datetime.now(timezone.utc).isoformat(),
                        'type': 'like'
                    }

                    if not self.dry_run:
                        result = self.cosmos_helper.create_like(cosmos_spark)
                        if not result:
                            logger.error(f"Failed to create spark {spark.id}")
                            self.stats['errors'] += 1
                        else:
                            logger.info(f"Created spark: user {spark.user_id} liked post {spark.post_id}")
                            self.stats['sparks'] += 1
                    else:
                        logger.info(f"Would create spark: user {spark.user_id} liked post {spark.post_id}")
                        self.stats['sparks'] += 1

                except Exception as e:
                    logger.error(f"Error migrating spark {spark.id}: {e}")
                    self.stats['errors'] += 1

    def migrate_comments(self):
        """Migrate comments from SQLAlchemy to Cosmos DB"""
        logger.info("Starting comment migration...")

        with self.db.session.begin():
            comments = self.db.session.query(self.Comment).all()

            for comment in comments:
                try:
                    # Transform to Cosmos DB format
                    cosmos_comment = {
                        'id': str(uuid.uuid4()),
                        'content': comment.content,
                        'user_id': str(comment.user_id),
                        'post_id': str(comment.post_id),
                        'zodiac_sign': comment.zodiac_sign,
                        'created_at': comment.created_at.isoformat() if comment.created_at else datetime.now(timezone.utc).isoformat(),
                        'type': 'comment'
                    }

                    if not self.dry_run:
                        result = self.cosmos_helper.create_comment(cosmos_comment)
                        if not result:
                            logger.error(f"Failed to create comment {comment.id}")
                            self.stats['errors'] += 1
                        else:
                            logger.info(f"Created comment: {comment.id}")
                            self.stats['comments'] += 1
                    else:
                        logger.info(f"Would create comment: {comment.id}")
                        self.stats['comments'] += 1

                except Exception as e:
                    logger.error(f"Error migrating comment {comment.id}: {e}")
                    self.stats['errors'] += 1

    def run_migration(self):
        """Run the complete migration"""
        logger.info("Starting data migration from SQLAlchemy to Cosmos DB")
        logger.info(f"Dry run: {self.dry_run}")

        if not self.init_sqlalchemy():
            logger.error("Failed to initialize SQLAlchemy connection")
            return False

        if not self.cosmos_helper:
            logger.error("Failed to initialize Cosmos DB connection")
            return False

        try:
            # Run migrations in order
            self.migrate_users()
            self.migrate_posts()
            self.migrate_follows()
            self.migrate_sparks()
            self.migrate_comments()

            # Print summary
            logger.info("Migration completed!")
            logger.info("Summary:")
            for key, value in self.stats.items():
                logger.info(f"  {key}: {value}")

            return True

        except Exception as e:
            logger.error(f"Migration failed: {e}")
            return False

def main():
    parser = argparse.ArgumentParser(description='Migrate data from SQLAlchemy to Cosmos DB')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be migrated without actually doing it')
    parser.add_argument('--batch-size', type=int, default=100, help='Number of items to process in each batch')

    args = parser.parse_args()

    migration = DataMigration(dry_run=args.dry_run, batch_size=args.batch_size)
    success = migration.run_migration()

    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()