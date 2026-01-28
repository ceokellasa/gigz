-- Add reveals tracking to profiles
alter table profiles 
add column if not exists reveals_remaining integer default 0,
add column if not exists reveals_used integer default 0;

-- Set reveals based on existing subscriptions
update profiles 
set reveals_remaining = case 
    when subscription_plan = '1_day' then 5
    when subscription_plan = '1_week' then 50
    when subscription_plan = '1_month' then 999999 -- unlimited (large number)
    else 0
end
where subscription_status = 'active' 
and subscription_expires_at > now()
and reveals_remaining = 0;
