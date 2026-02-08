-- Drop the existing check constraint
alter table profiles drop constraint if exists profiles_role_check;

-- Add the new check constraint including 'global'
alter table profiles add constraint profiles_role_check check (role in ('client', 'worker', 'global'));

-- Set the default value for role to 'global'
alter table profiles alter column role set default 'global';

-- Update the handle_new_user function to default to 'global'
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', coalesce(new.raw_user_meta_data->>'role', 'global'));
  return new;
end;
$$ language plpgsql security definer;
