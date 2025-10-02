-- Create users table with zodiac and numerology data
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    zodiac_sign VARCHAR(20) NOT NULL,
    birth_date DATE,
    birth_time TIME,
    birth_city VARCHAR(100),
    chinese_zodiac VARCHAR(20),
    chinese_element VARCHAR(20),
    vedic_zodiac VARCHAR(20),
    vedic_nakshatra VARCHAR(30),
    bio VARCHAR(200),
    profile_picture VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    last_seen TIMESTAMPTZ DEFAULT now(),
    is_online BOOLEAN DEFAULT FALSE,
    full_name VARCHAR(100),
    life_path_number INTEGER,
    destiny_number INTEGER,
    soul_urge_number INTEGER,
    personality_number INTEGER,
    birth_day_number INTEGER,
    tradition VARCHAR(50)
);

-- Create posts table
CREATE TABLE post (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INTEGER REFERENCES "user"(id) NOT NULL,
    zodiac_sign VARCHAR(20) NOT NULL,
    is_trend_hijack BOOLEAN DEFAULT FALSE,
    trend_category VARCHAR(50),
    image_url VARCHAR(255),
    spark_count INTEGER DEFAULT 0,
    echo_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create trends table
CREATE TABLE trend (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hashtag VARCHAR(50) NOT NULL,
    trend_type VARCHAR(20) NOT NULL,
    participant_count INTEGER DEFAULT 0,
    zodiac_sign VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create follows table with unique constraint
CREATE TABLE follow (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES "user"(id) NOT NULL,
    followed_id INTEGER REFERENCES "user"(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_follow_pair UNIQUE (follower_id, followed_id)
);

-- Create tarot_features table for tarot readings
CREATE TABLE tarot_features (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) NOT NULL,
    spread_type VARCHAR(50) NOT NULL,
    spread_data JSONB,
    insight TEXT,
    sound_enabled BOOLEAN DEFAULT FALSE,
    haptic_enabled BOOLEAN DEFAULT FALSE,
    reading_type VARCHAR(50) DEFAULT 'standard',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create archetype_oracle_reads table
CREATE TABLE archetype_oracle_reads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) NOT NULL,
    cosmic_profile JSONB,
    symbolic_spread JSONB,
    resonance_map JSONB,
    cycle_tracker JSONB,
    karmic_insights JSONB,
    tradition VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_post_user_id ON post(user_id);
CREATE INDEX idx_post_created_at ON post(created_at DESC);
CREATE INDEX idx_follow_follower_id ON follow(follower_id);
CREATE INDEX idx_follow_followed_id ON follow(followed_id);
CREATE INDEX idx_user_zodiac_sign ON "user"(zodiac_sign);
CREATE INDEX idx_tarot_features_user_id ON tarot_features(user_id);
CREATE INDEX idx_archetype_oracle_reads_user_id ON archetype_oracle_reads(user_id);

-- Insert some initial zodiac trend data
INSERT INTO trend (name, hashtag, trend_type, participant_count, zodiac_sign) VALUES
('Aries Fire Energy', '#FireSignEnergy', 'zodiac', 1250, 'Aries'),
('Taurus Earth Connection', '#EarthGrounded', 'zodiac', 890, 'Taurus'),
('Gemini Air Magic', '#AirSignEnergy', 'zodiac', 1456, 'Gemini'),
('Cancer Moon Power', '#MoonChild', 'zodiac', 2100, 'Cancer'),
('Leo Royal Energy', '#LeoSeason', 'zodiac', 3200, 'Leo'),
('Virgo Earth Magic', '#EarthMagic', 'zodiac', 1200, 'Virgo'),
('Libra Balance Seeker', '#BalanceGoals', 'zodiac', 1800, 'Libra'),
('Scorpio Deep Water', '#DeepWater', 'zodiac', 1650, 'Scorpio'),
('Sagittarius Adventure Flow', '#AdventureTime', 'zodiac', 1900, 'Sagittarius'),
('Capricorn Mountain Energy', '#MountainEnergy', 'zodiac', 1400, 'Capricorn'),
('Aquarius Future Vision', '#FutureVision', 'zodiac', 1750, 'Aquarius'),
('Pisces Dream Weaver', '#DreamWeaver', 'zodiac', 2200, 'Pisces');
