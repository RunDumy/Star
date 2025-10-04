-- Create zodiac chat messages table
CREATE TABLE zodiac_chat_messages (
    id SERIAL PRIMARY KEY,
    element VARCHAR(20) NOT NULL CHECK (element IN ('fire', 'earth', 'air', 'water')),
    user_id INTEGER REFERENCES "user"(id) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create groups table for general group chats (if needed in future)
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES "user"(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_members table
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) NOT NULL,
    user_id INTEGER REFERENCES "user"(id) NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_group_member UNIQUE (group_id, user_id)
);

-- Create general chat_messages table for group chats
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) NOT NULL,
    user_id INTEGER REFERENCES "user"(id) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table for chat notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    related_id INTEGER,
    related_type VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Update user table to add last_active field if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'last_active') THEN
        ALTER TABLE "user" ADD COLUMN last_active TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX idx_zodiac_chat_messages_element ON zodiac_chat_messages(element);
CREATE INDEX idx_zodiac_chat_messages_user_id ON zodiac_chat_messages(user_id);
CREATE INDEX idx_zodiac_chat_messages_created_at ON zodiac_chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_group_id ON chat_messages(group_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_user_last_active ON "user"(last_active);

-- Insert default zodiac element groups (these will be managed by the application)
-- Note: These are logical groups based on zodiac signs, not stored in groups table