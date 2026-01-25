-- ENFORCE RECEIVER_ID and CLEANUP
-- We want to ensure robust messaging. We will attempt to backfill receiver_id for legacy messages if possible,
-- and ensure new messages have it.

-- 1. Try to backfill receiver_id for messages where it is NULL
-- Logic: If sender is client, receiver is worker (if exists). If sender is worker, receiver is client.
UPDATE messages m
SET receiver_id = (
  CASE 
    WHEN m.sender_id = g.client_id THEN g.worker_id -- Sent by client, receiver is worker
    WHEN m.sender_id = g.worker_id THEN g.client_id -- Sent by worker, receiver is client
    ELSE g.client_id -- Fallback: assume sent to client if unknown (e.g. from applicant)
  END
)
FROM gigs g
WHERE m.gig_id = g.id
AND m.receiver_id IS NULL;

-- 2. Make receiver_id NOT NULL to enforce it going forward (Optional, but good practice)
-- ALTER TABLE messages ALTER COLUMN receiver_id SET NOT NULL; 
-- (Commented out to avoid breaking if there are still edge cases, but we should aim for this)

-- 3. Ensure Indexes exist
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_gig_id ON messages(gig_id);

-- 4. Re-verify policies (just to be safe)
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;

CREATE POLICY "messages_select_policy"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid()
    OR receiver_id = auth.uid()
  );

CREATE POLICY "messages_insert_policy"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
  );

-- 5. Force Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
