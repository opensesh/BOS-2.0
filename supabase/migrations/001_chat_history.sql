-- RLS Policies for Demo Environment
-- Run this in your Supabase SQL Editor to enable public access to chat history
-- This allows ALL visitors to see ALL chat sessions (for demo purposes)

-- ============================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP EXISTING POLICIES (if re-running)
-- ============================================

DROP POLICY IF EXISTS "Allow public read on chats" ON chats;
DROP POLICY IF EXISTS "Allow public insert on chats" ON chats;
DROP POLICY IF EXISTS "Allow public update on chats" ON chats;
DROP POLICY IF EXISTS "Allow public delete on chats" ON chats;

DROP POLICY IF EXISTS "Allow public read on messages" ON messages;
DROP POLICY IF EXISTS "Allow public insert on messages" ON messages;
DROP POLICY IF EXISTS "Allow public delete on messages" ON messages;

-- ============================================
-- 3. CREATE PUBLIC ACCESS POLICIES (DEMO)
-- ============================================

-- Chats table - full CRUD for demo
CREATE POLICY "Allow public read on chats"
  ON chats FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on chats"
  ON chats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on chats"
  ON chats FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on chats"
  ON chats FOR DELETE
  USING (true);

-- Messages table - full CRUD for demo
CREATE POLICY "Allow public read on messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete on messages"
  ON messages FOR DELETE
  USING (true);

-- ============================================
-- 4. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON chats TO anon;
GRANT ALL ON chats TO authenticated;
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;

-- ============================================
-- DONE! Chat history is now publicly accessible.
-- All sessions will be visible to all visitors.
-- ============================================
