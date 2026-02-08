-- SIMPLE AND PERMISSIVE MESSAGE POLICIES
-- This ensures all involved parties can see and send messages

-- Drop ALL existing message policies
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "Users can view messages for gigs they are involved in." ON messages;
DROP POLICY IF EXISTS "Users can insert messages for gigs they are involved in." ON messages;
DROP POLICY IF EXISTS "Users can view messages they are part of" ON messages;
DROP POLICY IF EXISTS "Users can send messages to gigs they are involved in" ON messages;

-- Add receiver_id column if not exists
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES profiles(id);

-- SELECT policy: You can see messages if you sent them, received them, or own the gig
CREATE POLICY "messages_select_policy"
  ON messages FOR SELECT
  USING ( 
    auth.uid() IS NOT NULL
    AND (
      sender_id = auth.uid()
      OR receiver_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM gigs 
        WHERE gigs.id = messages.gig_id 
        AND gigs.client_id = auth.uid()
      )
    )
  );

-- INSERT policy: Any authenticated user can send if they set themselves as sender
CREATE POLICY "messages_insert_policy"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_id = auth.uid()
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_gig_id ON messages(gig_id);

-- Enable realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE messages;
