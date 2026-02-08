-- Create table for feature suggestions
create table if not exists public.feature_suggestions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  suggestion text not null,
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.feature_suggestions enable row level security;

-- Users can insert their own suggestions
create policy "Users can insert own suggestions"
  on public.feature_suggestions for insert
  with check (auth.uid() = user_id);

-- Users can view their own suggestions (optional)
create policy "Users can view own suggestions"
  on public.feature_suggestions for select
  using (auth.uid() = user_id);

-- Admins can view all suggestions
-- This assumes you have an 'is_admin' function or similar. 
-- For now, we allow the specific admin email or rely on app-level checks for the dashboard view, 
-- but strictly speaking, we need a policy.
-- Note: AdminDashboard.jsx usually bypasses RLS if using service role, but client uses anon.
-- We'll allow read access to the specific admin email.

create policy "Admins can view all suggestions"
  on public.feature_suggestions for select
  using (auth.jwt() ->> 'email' = 'nsjdfmjr@gmail.com');
