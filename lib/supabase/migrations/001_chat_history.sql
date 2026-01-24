-- Chat Sessions and Search History Tables for BOS
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Chat sessions table - stores complete chat conversations
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,                    -- Browser session identifier
  title TEXT NOT NULL,                         -- Title derived from first user message
  preview TEXT,                                -- Preview snippet from assistant response
  messages JSONB NOT NULL DEFAULT '[]',        -- Array of message objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history table - stores individual searches for suggestions
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,                    -- Browser session identifier
  query TEXT NOT NULL,                         -- The search query text
  mode TEXT NOT NULL DEFAULT 'search',         -- 'search' or 'research'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_session_id ON search_history(session_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_mode ON search_history(mode);

-- Full-text search index for query autocomplete
CREATE INDEX IF NOT EXISTS idx_search_history_query_fts 
  ON search_history USING gin(to_tsvector('english', query));

-- Partial index for recent queries (last 30 days) for faster trending lookups
CREATE INDEX IF NOT EXISTS idx_search_history_recent 
  ON search_history(created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '30 days';

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on chat_sessions
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - Optional but recommended
-- Uncomment these if you want to enable RLS

-- ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations for now (adjust based on auth needs)
-- CREATE POLICY "Allow all for chat_sessions" ON chat_sessions FOR ALL USING (true);
-- CREATE POLICY "Allow all for search_history" ON search_history FOR ALL USING (true);

-- Grant permissions (adjust based on your setup)
-- GRANT ALL ON chat_sessions TO anon, authenticated;
-- GRANT ALL ON search_history TO anon, authenticated;
