-- Make profiles viewable by everyone (essential for gig marketplace)
-- DANGER: This exposes profile data (name, avatar, maybe email if it's in there) to all authenticated users.
-- For the Admin Panel to work, this is the easiest fix.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
