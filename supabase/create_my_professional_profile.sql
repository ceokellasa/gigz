-- Create professional profile for current logged-in user
-- Run this in Supabase SQL Editor

INSERT INTO professional_profiles (user_id, profession, bio)
VALUES (
    auth.uid(), 
    'Professional', 
    'Professional account for digital marketplace'
)
ON CONFLICT (user_id) DO UPDATE 
SET profession = 'Professional';

-- Verify it was created
SELECT id, user_id, profession FROM professional_profiles WHERE user_id = auth.uid();
