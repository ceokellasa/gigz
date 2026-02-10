-- Check if you have a professional_profiles record
-- Run this in Supabase SQL Editor to see your professional status

-- 1. Check your user ID
SELECT auth.uid() as my_user_id;

-- 2. Check if you have a professional_profiles record
SELECT * FROM professional_profiles WHERE id = auth.uid();

-- 3. Check all professional_profiles (to see structure)
SELECT id, profession, bio FROM professional_profiles LIMIT 5;

-- 4. If you DON'T have a record, create one:
-- (Uncomment and run this if needed)
-- INSERT INTO professional_profiles (id, profession, bio)
-- VALUES (auth.uid(), 'Professional', 'My professional profile')
-- ON CONFLICT (id) DO NOTHING;
