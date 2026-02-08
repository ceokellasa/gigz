-- CHAT RETENTION & CLEANUP

-- 1. Function to clean old messages (older than 1 week)
-- You can run this manually or schedule it with pg_cron if available on your plan
CREATE OR REPLACE FUNCTION delete_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM messages
  WHERE created_at < NOW() - INTERVAL '1 week';
END;
$$ LANGUAGE plpgsql;

-- 2. (Optional) If you have pg_cron extension enabled:
-- SELECT cron.schedule('0 0 * * *', $$SELECT delete_old_messages()$$);

-- 3. Run it once now to clean up
SELECT delete_old_messages();
