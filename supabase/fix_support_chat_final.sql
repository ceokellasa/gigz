-- 1. CRITICAL: Allow messages to exist without a Gig ID (for Support/DMs)
ALTER TABLE messages ALTER COLUMN gig_id DROP NOT NULL;

-- 2. Ensure receiver_id column exists
ALTER TABLE messages ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES profiles(id);

-- 3. Update Policies to explicitly handle Support DMs
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;

-- Allow users to see messages if they are the SENDER or RECEIVER
CREATE POLICY "messages_select_policy"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id 
    OR auth.uid() = receiver_id
    -- Also include gig owners if it is a gig message
    OR (gig_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM gigs WHERE gigs.id = messages.gig_id AND gigs.client_id = auth.uid()
    ))
  );

-- Allow users to INSERT messages if they are the sender
CREATE POLICY "messages_insert_policy"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
  );
