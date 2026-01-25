-- UNREAD MESSAGES SUPPORT

-- 1. Add read column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

-- 2. Index for performance (counting unread messages)
CREATE INDEX IF NOT EXISTS idx_messages_read_receiver ON messages(receiver_id, read);

-- 3. Function to mark conversation as read (RPC) - Optional but useful for efficient updates
CREATE OR REPLACE FUNCTION mark_messages_read(p_gig_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET read = TRUE
  WHERE gig_id = p_gig_id
    AND receiver_id = p_user_id
    AND read = FALSE;
END;
$$ LANGUAGE plpgsql;
