-- Create chat system tables
-- Migration: 20250930180000_create_chat_system

-- Enable RLS
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Channels/Rooms table
CREATE TABLE IF NOT EXISTS chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('public', 'private', 'direct')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Channel participants
CREATE TABLE IF NOT EXISTS chat_channel_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(channel_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions
CREATE TABLE IF NOT EXISTS chat_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- User presence/online status
CREATE TABLE IF NOT EXISTS chat_user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id_created_at ON chat_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_channel_participants_channel_id ON chat_channel_participants(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_channel_participants_user_id ON chat_channel_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reactions_message_id ON chat_message_reactions(message_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_user_presence ENABLE ROW LEVEL SECURITY;

-- Chat Channels Policies
CREATE POLICY "Users can view channels they are participants in" ON chat_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_channel_participants
      WHERE channel_id = chat_channels.id
      AND user_id = auth.uid()
      AND is_active = true
    ) OR type = 'public'
  );

CREATE POLICY "Users can create channels" ON chat_channels
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel owners/admins can update channels" ON chat_channels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_channel_participants
      WHERE channel_id = chat_channels.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- Channel Participants Policies
CREATE POLICY "Users can view participants in their channels" ON chat_channel_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_channel_participants cp
      WHERE cp.channel_id = chat_channel_participants.channel_id
      AND cp.user_id = auth.uid()
      AND cp.is_active = true
    )
  );

CREATE POLICY "Users can join public channels" ON chat_channel_participants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_channels
      WHERE id = channel_id
      AND type = 'public'
    )
  );

CREATE POLICY "Channel owners/admins can manage participants" ON chat_channel_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_channel_participants cp
      WHERE cp.channel_id = chat_channel_participants.channel_id
      AND cp.user_id = auth.uid()
      AND cp.role IN ('owner', 'admin')
      AND cp.is_active = true
    )
  );

-- Messages Policies
CREATE POLICY "Users can view messages in their channels" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_channel_participants
      WHERE channel_id = chat_messages.channel_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Users can send messages to channels they are in" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_channel_participants
      WHERE channel_id = chat_messages.channel_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Users can edit their own messages" ON chat_messages
  FOR UPDATE USING (
    auth.uid() = user_id AND
    edited_at IS NULL AND
    created_at > NOW() - INTERVAL '15 minutes'
  );

CREATE POLICY "Users can delete their own messages or admins can delete any" ON chat_messages
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM chat_channel_participants
      WHERE channel_id = chat_messages.channel_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- Message Reactions Policies
CREATE POLICY "Users can view reactions in their channels" ON chat_message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_channel_participants cp
      JOIN chat_messages m ON m.channel_id = cp.channel_id
      WHERE m.id = chat_message_reactions.message_id
      AND cp.user_id = auth.uid()
      AND cp.is_active = true
    )
  );

CREATE POLICY "Users can add reactions to messages in their channels" ON chat_message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_channel_participants cp
      JOIN chat_messages m ON m.channel_id = cp.channel_id
      WHERE m.id = chat_message_reactions.message_id
      AND cp.user_id = auth.uid()
      AND cp.is_active = true
    )
  );

CREATE POLICY "Users can remove their own reactions" ON chat_message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- User Presence Policies
CREATE POLICY "Users can view presence of others in their channels" ON chat_user_presence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_channel_participants cp1
      JOIN chat_channel_participants cp2 ON cp1.channel_id = cp2.channel_id
      WHERE cp1.user_id = auth.uid()
      AND cp2.user_id = chat_user_presence.user_id
      AND cp1.is_active = true
      AND cp2.is_active = true
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can update their own presence" ON chat_user_presence
  FOR ALL USING (auth.uid() = user_id);

-- Functions for chat system

-- Function to create a direct message channel between two users
CREATE OR REPLACE FUNCTION create_direct_channel(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  channel_id UUID;
  channel_name TEXT;
BEGIN
  -- Create a consistent channel name (smaller id first)
  IF user1_id < user2_id THEN
    channel_name := user1_id || '_' || user2_id;
  ELSE
    channel_name := user2_id || '_' || user1_id;
  END IF;

  -- Check if direct channel already exists
  SELECT id INTO channel_id
  FROM chat_channels
  WHERE type = 'direct' AND name = channel_name;

  -- If not exists, create it
  IF channel_id IS NULL THEN
    INSERT INTO chat_channels (name, type, created_by)
    VALUES (channel_name, 'direct', user1_id)
    RETURNING id INTO channel_id;

    -- Add both users as participants
    INSERT INTO chat_channel_participants (channel_id, user_id, role)
    VALUES (channel_id, user1_id, 'member'), (channel_id, user2_id, 'member');
  END IF;

  RETURN channel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM chat_messages m
    JOIN chat_channel_participants cp ON cp.channel_id = m.channel_id
    WHERE cp.user_id = $1
    AND cp.is_active = true
    AND m.created_at > COALESCE(cp.last_seen_at, '1970-01-01'::timestamp)
    AND m.user_id != $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last seen timestamp
CREATE OR REPLACE FUNCTION update_last_seen(channel_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_channel_participants
  SET last_seen_at = NOW()
  WHERE channel_id = $1 AND user_id = $2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a default general channel
INSERT INTO chat_channels (name, description, type, created_by)
SELECT 'general', 'Algemeen kanaal voor iedereen', 'public', id
FROM auth.users
WHERE email LIKE '%admin%' OR email LIKE '%jeffreasy%'
LIMIT 1;

-- Add all existing users to the general channel
INSERT INTO chat_channel_participants (channel_id, user_id, role)
SELECT
  (SELECT id FROM chat_channels WHERE name = 'general' LIMIT 1),
  id,
  'member'
FROM auth.users
ON CONFLICT (channel_id, user_id) DO NOTHING;