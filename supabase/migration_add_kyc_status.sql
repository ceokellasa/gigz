-- Add kyc_status column to profiles table if it doesn't exist
alter table public.profiles 
add column if not exists kyc_status varchar(20) default 'pending';

-- Create an index for faster lookups
create index if not exists profiles_kyc_status_idx on public.profiles(kyc_status);

-- Optional: For development, you might want to auto-verify your own account
-- Replace 'YOUR_USER_ID' with your actual UUID
-- update public.profiles set kyc_status = 'verified' where id = 'YOUR_USER_ID';
