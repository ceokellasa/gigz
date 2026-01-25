-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  role text check (role in ('client', 'worker', 'global')) not null default 'global',

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security!
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Gigs Table
create table gigs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  category text not null,
  budget numeric not null,
  deadline timestamp with time zone not null,
  status text check (status in ('open', 'in_progress', 'under_review', 'completed')) default 'open',
  client_id uuid references profiles(id) not null,
  worker_id uuid references profiles(id)
);

alter table gigs enable row level security;

create policy "Gigs are viewable by everyone."
  on gigs for select
  using ( true );

create policy "Clients can create gigs."
  on gigs for insert
  with check ( auth.uid() = client_id );

create policy "Clients can update their own gigs."
  on gigs for update
  using ( auth.uid() = client_id );

create policy "Workers can update gigs they are assigned to."
  on gigs for update
  using ( auth.uid() = worker_id );

-- Applications Table
create table applications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  gig_id uuid references gigs(id) not null,
  worker_id uuid references profiles(id) not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  cover_letter text
);

alter table applications enable row level security;

create policy "Clients can view applications for their gigs."
  on applications for select
  using ( exists ( select 1 from gigs where gigs.id = applications.gig_id and gigs.client_id = auth.uid() ) );

create policy "Workers can view their own applications."
  on applications for select
  using ( auth.uid() = worker_id );

create policy "Workers can create applications."
  on applications for insert
  with check ( auth.uid() = worker_id );

-- Messages Table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  gig_id uuid references gigs(id) not null,
  sender_id uuid references profiles(id) not null,
  content text not null
);

alter table messages enable row level security;

create policy "Users can view messages for gigs they are involved in."
  on messages for select
  using ( 
    exists ( 
      select 1 from gigs 
      where gigs.id = messages.gig_id 
      and (gigs.client_id = auth.uid() or gigs.worker_id = auth.uid()) 
    ) 
  );

create policy "Users can insert messages for gigs they are involved in."
  on messages for insert
  with check ( 
    exists ( 
      select 1 from gigs 
      where gigs.id = messages.gig_id 
      and (gigs.client_id = auth.uid() or gigs.worker_id = auth.uid()) 
    ) 
    and auth.uid() = sender_id
  );

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', coalesce(new.raw_user_meta_data->>'role', 'global'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
