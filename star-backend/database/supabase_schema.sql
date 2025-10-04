-- Schema for Supabase (PostgreSQL) to match SQLAlchemy models in backend

-- Note: "user" can be used as a table name in Postgres, but to avoid ambiguity we quote it.
create table if not exists "user" (
  id serial primary key,
  username varchar(50) unique not null,
  password_hash varchar(128) not null,
  zodiac_sign varchar(20) not null,
  birth_date date null,
  birth_time time null,
  birth_city varchar(100) null,
  chinese_zodiac varchar(20) null,
  chinese_element varchar(20) null,
  vedic_zodiac varchar(20) null,
  vedic_nakshatra varchar(30) null,
  bio varchar(200) null,
  profile_picture varchar(255) null,
  created_at timestamp with time zone default now(),
  last_seen timestamp with time zone default now(),
  is_online boolean default false
);

create table if not exists post (
  id serial primary key,
  content text not null,
  user_id integer not null references "user"(id) on delete cascade,
  zodiac_sign varchar(20) not null,
  is_trend_hijack boolean default false,
  trend_category varchar(50) null,
  image_url varchar(255) null,
  spark_count integer default 0,
  echo_count integer default 0,
  created_at timestamp with time zone default now()
);

create index if not exists idx_post_user_id on post(user_id);
create index if not exists idx_post_created_at on post(created_at desc);

create table if not exists trend (
  id serial primary key,
  name varchar(100) not null,
  hashtag varchar(50) not null,
  trend_type varchar(20) not null,
  participant_count integer default 0,
  zodiac_sign varchar(20) null,
  created_at timestamp with time zone default now()
);

-- Optional: follows table for social graph
create table if not exists follow (
  id serial primary key,
  follower_id integer not null references "user"(id) on delete cascade,
  followed_id integer not null references "user"(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (follower_id, followed_id)
);

create index if not exists idx_follow_follower on follow(follower_id);
create index if not exists idx_follow_followed on follow(followed_id);

-- Additional tables for zodiac-themed profiles and Cosmic Network

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extended from user)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  username TEXT NOT NULL UNIQUE,
  zodiac_sign TEXT NOT NULL,
  moon_sign TEXT,
  rising_sign TEXT,
  bio TEXT,
  favorite_planet TEXT,
  favorite_tarot TEXT,
  color_palette TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Friends table
CREATE TABLE IF NOT EXISTS friends (
  user_id UUID REFERENCES profiles(id),
  friend_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, friend_id)
);

-- Interactions table (likes, comments)
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  target_user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL, -- 'like' or 'comment'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts table (extended from post)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  zodiac_tag TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wall messages table
CREATE TABLE IF NOT EXISTS wall_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'friends', -- 'public' or 'friends'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Groups table for zodiac houses
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- e.g., 'Libra'
  type TEXT NOT NULL, -- e.g., 'zodiac'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  group_id UUID REFERENCES groups(id),
  user_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id)
);

-- Star Points and Challenges system
CREATE TABLE IF NOT EXISTS star_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'daily', 'weekly', 'achievement'
  zodiac_sign TEXT, -- Optional: zodiac-specific challenges
  element TEXT, -- Optional: element-specific challenges
  points_reward INTEGER NOT NULL,
  requirements JSONB, -- Flexible requirements structure
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  challenge_id UUID REFERENCES challenges(id),
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  progress JSONB DEFAULT '{}', -- Track progress towards completion
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS star_point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  challenge_id UUID REFERENCES challenges(id),
  points_earned INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'challenge_completion', 'bonus', 'level_up'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_star_points_user_id ON star_points(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenges_zodiac ON challenges(zodiac_sign);
CREATE INDEX IF NOT EXISTS idx_challenges_element ON challenges(element);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_star_point_transactions_user_id ON star_point_transactions(user_id);

-- RLS policies
ALTER TABLE star_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own star points" ON star_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own star points" ON star_points FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active challenges" ON challenges FOR SELECT USING (is_active = true);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own challenges" ON user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own challenges" ON user_challenges FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE star_point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON star_point_transactions FOR SELECT USING (auth.uid() = user_id);

-- Notifications table for real-time cosmic signals
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'cosmic_signal', 'star_points', 'level_up'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID, -- Can reference posts, users, or other entities
  related_type TEXT, -- 'post', 'user', 'challenge', etc.
  metadata JSONB DEFAULT '{}', -- Additional data like sender info, post content, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Group chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'cosmic_signal'
  metadata JSONB DEFAULT '{}', -- For cosmic effects, attachments, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for chat messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_group_id ON chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- RLS policies for chat messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view messages" ON chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = chat_messages.group_id
    AND gm.user_id = auth.uid()
  )
);
CREATE POLICY "Group members can insert messages" ON chat_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = chat_messages.group_id
    AND gm.user_id = auth.uid()
  )
);

-- Enable Realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Analytics events table for tracking user interactions
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- RLS policies for analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics events" ON analytics_events FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can view their own analytics events" ON analytics_events FOR SELECT USING (
  auth.uid() = user_id
);
