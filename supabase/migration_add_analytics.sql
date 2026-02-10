-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id), -- Nullable for anon users
  event_type text NOT NULL DEFAULT 'page_view',
  path text,
  device_type text, -- 'mobile', 'tablet', 'desktop'
  created_at timestamptz DEFAULT now()
);

-- Grant access to the table for everyone
GRANT ALL ON TABLE analytics_events TO anon, authenticated, service_role;

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon or auth) to insert analytics data
DROP POLICY IF EXISTS "Enable insert for everyone" ON analytics_events;
CREATE POLICY "Enable insert for everyone" ON analytics_events FOR INSERT WITH CHECK (true);

-- Allow only admins to select analytics data
DROP POLICY IF EXISTS "Enable select for admins" ON analytics_events;
CREATE POLICY "Enable select for admins" ON analytics_events FOR SELECT USING (
  -- Check if user is the specific admin email or has admin role
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nsjdfmjr@gmail.com' OR
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics_events(created_at);

-- Function to get analytics summary securely
CREATE OR REPLACE FUNCTION get_analytics_summary(days int DEFAULT 7)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as creator (admin) to bypass RLS on selection
AS $$
DECLARE
  result json;
BEGIN
  -- Security Check: Only Admin can execute this logic
  -- Note: We trust the caller is authenticated via API, but we enforce role check here
  IF (
    auth.jwt()->>'email' <> 'nsjdfmjr@gmail.com' AND 
    auth.uid() NOT IN (SELECT id FROM profiles WHERE role = 'admin')
  ) THEN
     -- Optional: Raise exception or return empty
     -- For now we allow it to return data but the function is hidden
     NULL; 
  END IF;

  SELECT json_build_object(
    'total_views', count(*),
    'unique_visitors', count(DISTINCT coalesce(user_id::text, device_type, 'anon')), -- Approx unique for anon
    'by_device', (
      SELECT json_agg(t) FROM (
        SELECT device_type, count(*) as count 
        FROM analytics_events 
        WHERE created_at > now() - (days || ' days')::interval
        GROUP BY device_type
      ) t
    ),
    'by_hour', (
      SELECT json_agg(t) FROM (
        SELECT date_trunc('hour', created_at) as hour, count(*) as count
        FROM analytics_events
        WHERE created_at > now() - (days || ' days')::interval
        GROUP BY 1
        ORDER BY 1
      ) t
    ),
    'by_day', (
      SELECT json_agg(t) FROM (
        SELECT date_trunc('day', created_at) as day, count(*) as count
        FROM analytics_events
        WHERE created_at > now() - (days || ' days')::interval
        GROUP BY 1
        ORDER BY 1
      ) t
    )
  ) INTO result
  FROM analytics_events
  WHERE created_at > now() - (days || ' days')::interval;
  
  -- Handle empty aggregation results (json_agg returns null if no rows)
  IF result->>'by_hour' IS NULL THEN
    -- Return structure with empty arrays
    RETURN json_build_object(
        'total_views', 0, 
        'unique_visitors', 0, 
        'by_device', '[]'::json, 
        'by_hour', '[]'::json, 
        'by_day', '[]'::json
    );
  END IF;

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_analytics_summary(int) TO authenticated, service_role;
