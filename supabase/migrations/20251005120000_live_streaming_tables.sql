-- Live streaming tables for AgoraRTC integration

-- Live Stream table for real-time streaming
CREATE TABLE IF NOT EXISTS live_stream (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  agora_token TEXT NOT NULL,
  zodiac_sign TEXT,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Stream Chat table for live stream messaging
CREATE TABLE IF NOT EXISTS stream_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID REFERENCES live_stream(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  zodiac_sign TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for live streaming tables
CREATE INDEX IF NOT EXISTS idx_live_stream_user_id ON live_stream(user_id);
CREATE INDEX IF NOT EXISTS idx_live_stream_is_active ON live_stream(is_active);
CREATE INDEX IF NOT EXISTS idx_stream_chat_stream_id ON stream_chat(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_created_at ON stream_chat(created_at DESC);