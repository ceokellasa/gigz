-- Add phone_number to profiles table
alter table profiles add column if not exists phone_number text;

-- Update handle_new_user function to include phone_number and auto-confirm email logic (optional, but handling metadata)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, phone_number)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    coalesce(new.raw_user_meta_data->>'role', 'global'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;
