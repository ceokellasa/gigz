-- Create a policy to allow the specific admin email to view ALL profiles
-- Note: This matches the email used in the frontend code
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nsjdfmjr@gmail.com'
);

-- Note: Accessing auth.users from a policy directly can sometimes be restricted or require security definer views.
-- A more robust way if the above fails is to use the JWT claim if available, or rely on a public flag.
-- Retrying with a safer approach using a function if the direct select fails, but let's try strict RLS first.
-- Actually, a common pattern is to have an `is_admin` boolean in the profiles table itself.

-- Alternative if the above is too complex for standard RLS:
-- Just allow everyone to read profiles (public profiles are usually fine to read for a social/gig app)
-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
-- CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
