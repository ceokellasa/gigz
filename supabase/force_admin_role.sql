-- Force Update the Admin Role for your email
-- This uses a secure function to bypass RLS restrictions and find your user ID

CREATE OR REPLACE FUNCTION public.force_make_admin(target_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- Run as superuser/owner to access auth.users
SET search_path = public
AS $$
DECLARE
  user_found_id uuid;
BEGIN
  -- 1. Find the User ID in auth.users
  SELECT id INTO user_found_id
  FROM auth.users
  WHERE email = target_email;

  -- 2. If found, update the profiles table
  IF user_found_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = user_found_id;
    return 'Success: User ' || target_email || ' is now an Admin.';
  ELSE
    return 'Error: Email not found in database.';
  END IF;
END;
$$;

-- Execute the function for your email
SELECT public.force_make_admin('nsjdfmjr@gmail.com');
