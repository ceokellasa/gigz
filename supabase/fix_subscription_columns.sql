-- Add missing subscription columns to profiles table
alter table profiles 
add column if not exists subscription_start_date timestamptz,
add column if not exists subscription_status text default 'inactive';

-- Update existing subscribed users to have 'active' status
update profiles 
set subscription_status = 'active' 
where subscription_expires_at is not null 
and subscription_expires_at > now()
and subscription_status is null;
