-- Create a function to get admin stats securely
-- This runs with SECURITY DEFINER to bypass RLS for counting total rows
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users integer;
  total_gigs integer;
  total_professionals integer;
  total_messages integer;
BEGIN
  SELECT count(*) INTO total_users FROM profiles;
  SELECT count(*) INTO total_gigs FROM gigs;
  SELECT count(*) INTO total_professionals FROM professional_profiles;
  SELECT count(*) INTO total_messages FROM messages;
  
  RETURN json_build_object(
    'total_users', total_users,
    'total_gigs', total_gigs,
    'total_professionals', total_professionals,
    'total_messages', total_messages
  );
END;
$$;
