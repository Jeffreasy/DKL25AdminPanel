-- Add chat enhancements: typing indicators table and full-text search
-- Migration: 20250930190000_add_chat_enhancements

-- Typing indicators table for persistent typing state
CREATE TABLE IF NOT EXISTS chat_typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Enable RLS on typing indicators
ALTER TABLE chat_typing_indicators ENABLE ROW LEVEL SECURITY;

-- Typing indicators policies
CREATE POLICY "Users can view typing indicators in their channels" ON chat_typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_channel_participants
      WHERE channel_id = chat_typing_indicators.channel_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Users can manage their own typing indicators" ON chat_typing_indicators
  FOR ALL USING (auth.uid() = user_id);

-- Function to start typing (insert/update typing indicator)
CREATE OR REPLACE FUNCTION start_typing(channel_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO chat_typing_indicators (channel_id, user_id, started_at)
  VALUES ($1, $2, NOW())
  ON CONFLICT (channel_id, user_id)
  DO UPDATE SET started_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to stop typing (delete typing indicator)
CREATE OR REPLACE FUNCTION stop_typing(channel_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM chat_typing_indicators
  WHERE channel_id = $1 AND user_id = $2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old typing indicators (call this periodically)
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM chat_typing_indicators
  WHERE started_at < NOW() - INTERVAL '10 seconds';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Full-text search setup for messages
-- Add a generated column for searchable content
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS search_content TEXT GENERATED ALWAYS AS (
  COALESCE(content, '') || ' ' ||
  COALESCE(file_name, '')
) STORED;

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_chat_messages_fts
ON chat_messages USING gin(to_tsvector('dutch', search_content));

-- Function for searching messages
CREATE OR REPLACE FUNCTION search_chat_messages(
  search_query TEXT,
  channel_ids UUID[] DEFAULT NULL,
  auth_user_id UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  channel_id UUID,
  user_id UUID,
  content TEXT,
  message_type TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  user_email TEXT,
  user_full_name TEXT,
  channel_name TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.channel_id,
    m.user_id,
    m.content,
    m.message_type,
    m.file_url,
    m.file_name,
    m.file_size,
    m.created_at,
    u.email as user_email,
    u.raw_user_meta_data->>'full_name' as user_full_name,
    c.name as channel_name,
    ts_rank(to_tsvector('dutch', m.search_content), plainto_tsquery('dutch', search_query)) as rank
  FROM chat_messages m
  JOIN auth.users u ON u.id = m.user_id
  JOIN chat_channels c ON c.id = m.channel_id
  WHERE
    -- User must be participant in the channel
    EXISTS (
      SELECT 1 FROM chat_channel_participants cp
      WHERE cp.channel_id = m.channel_id
      AND cp.user_id = COALESCE($3, auth.uid())
      AND cp.is_active = true
    )
    -- Filter by channels if provided
    AND (channel_ids IS NULL OR m.channel_id = ANY(channel_ids))
    -- Full-text search
    AND to_tsvector('dutch', m.search_content) @@ plainto_tsquery('dutch', search_query)
  ORDER BY rank DESC, m.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get message history with pagination
CREATE OR REPLACE FUNCTION get_message_history(
  p_channel_id UUID,
  p_user_id UUID,
  before_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  channel_id UUID,
  user_id UUID,
  content TEXT,
  message_type TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  reply_to_id UUID,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  user_email TEXT,
  user_full_name TEXT,
  user_avatar_url TEXT,
  reactions JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.channel_id,
    m.user_id,
    m.content,
    m.message_type,
    m.file_url,
    m.file_name,
    m.file_size,
    m.reply_to_id,
    m.edited_at,
    m.created_at,
    u.email as user_email,
    u.raw_user_meta_data->>'full_name' as user_full_name,
    u.raw_user_meta_data->>'avatar_url' as user_avatar_url,
    COALESCE(
      json_agg(
        json_build_object(
          'emoji', r.emoji,
          'count', COUNT(*),
          'users', json_agg(
            json_build_object(
              'id', ru.id,
              'email', ru.email,
              'full_name', ru.raw_user_meta_data->>'full_name'
            )
          )
        )
      ) FILTER (WHERE r.emoji IS NOT NULL),
      '[]'::json
    ) as reactions
  FROM chat_messages m
  JOIN auth.users u ON u.id = m.user_id
  LEFT JOIN chat_message_reactions r ON r.message_id = m.id
  LEFT JOIN auth.users ru ON ru.id = r.user_id
  WHERE
    m.channel_id = $1
    AND EXISTS (
      SELECT 1 FROM chat_channel_participants cp
      WHERE cp.channel_id = m.channel_id
      AND cp.user_id = $2
      AND cp.is_active = true
    )
    AND (before_timestamp IS NULL OR m.created_at < before_timestamp)
  GROUP BY m.id, u.id
  ORDER BY m.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to cleanup old typing indicators (runs every minute)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-typing-indicators', '* * * * *', 'SELECT cleanup_old_typing_indicators();');

-- Add some helpful indexes
CREATE INDEX IF NOT EXISTS idx_chat_typing_indicators_channel_id ON chat_typing_indicators(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_indicators_started_at ON chat_typing_indicators(started_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_search_content ON chat_messages USING gin(to_tsvector('dutch', search_content));