-- Add latitude and longitude columns to gigs table
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS longitude double precision;

-- Function to search nearby gigs using Haversine formula
-- Returns gigs with distance in km
CREATE OR REPLACE FUNCTION get_nearby_gigs(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  budget text,
  budget_type text,
  is_remote boolean,
  location text,
  image_url text,
  status text,
  created_at timestamptz,
  client_id uuid,
  mobile_number text,
  latitude double precision,
  longitude double precision,
  dist_km double precision,
  client_full_name text,
  client_avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.title,
    g.description,
    g.category,
    g.budget,
    g.budget_type,
    g.is_remote,
    g.location,
    g.image_url,
    g.status,
    g.created_at,
    g.client_id,
    g.mobile_number,
    g.latitude,
    g.longitude,
    (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0, 
          cos(radians(user_lat)) * cos(radians(g.latitude)) *
          cos(radians(g.longitude) - radians(user_lng)) +
          sin(radians(user_lat)) * sin(radians(g.latitude))
        ))
      )
    ) AS dist_km,
    p.full_name as client_full_name,
    p.avatar_url as client_avatar_url
  FROM
    gigs g
  JOIN
    profiles p ON g.client_id = p.id
  WHERE
    g.status = 'open'
    AND g.latitude IS NOT NULL
    AND g.longitude IS NOT NULL
    AND g.is_remote = false -- Only show non-remote gigs for precise location search
    AND (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(user_lat)) * cos(radians(g.latitude)) *
          cos(radians(g.longitude) - radians(user_lng)) +
          sin(radians(user_lat)) * sin(radians(g.latitude))
        ))
      )
    ) < radius_km
  ORDER BY
    dist_km ASC;
END;
$$;
