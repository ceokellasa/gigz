-- Add latitude and longitude columns to professional_profiles table
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS longitude double precision;

-- Create an index for faster spatial queries (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_professional_profiles_lat_long ON professional_profiles (latitude, longitude);

-- Update RLS policies if needed (usually existing select policies cover new columns)
