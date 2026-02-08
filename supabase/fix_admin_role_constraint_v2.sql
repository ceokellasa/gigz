-- 1. Drop the old constraint that restricts roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add the new constraint that INCLUDES 'admin'
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('client', 'worker', 'global', 'admin'));

-- 3. Now we can safely make you an admin
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'nsjdfmjr@gmail.com');

-- 4. Verify it worked (Fixed ambiguous column error)
SELECT auth.users.email, profiles.role 
FROM auth.users 
JOIN profiles ON auth.users.id = profiles.id 
WHERE auth.users.email = 'nsjdfmjr@gmail.com';
