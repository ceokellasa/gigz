-- Add views column to gigs table
alter table gigs add column if not exists views integer default 0;

-- Create notifications table
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references profiles(id) not null,
  type text check (type in ('message', 'application', 'status_update')) not null,
  message text not null,
  link text,
  is_read boolean default false
);

-- Enable RLS on notifications
alter table notifications enable row level security;

-- Policy: Users can view their own notifications
create policy "Users can view their own notifications."
  on notifications for select
  using ( auth.uid() = user_id );

-- Policy: System/Users can insert notifications (for now, we'll allow authenticated users to insert to trigger notifications for others, 
-- ideally this should be done via Edge Functions or Database Triggers for security, but for this MVP we'll allow client-side insertion)
create policy "Users can insert notifications."
  on notifications for insert
  with check ( auth.role() = 'authenticated' );

-- Policy: Users can update their own notifications (mark as read)
create policy "Users can update their own notifications."
  on notifications for update
  using ( auth.uid() = user_id );

-- Update Messages Policy to allow applicants to chat
-- Drop existing policies to avoid conflicts/confusion
drop policy if exists "Users can view messages for gigs they are involved in." on messages;
drop policy if exists "Users can insert messages for gigs they are involved in." on messages;

-- New Policy: View messages
-- Allow if:
-- 1. You are the client of the gig
-- 2. You are the worker assigned to the gig (gig.worker_id)
-- 3. You have an application for the gig (applications table)
create policy "Users can view messages."
  on messages for select
  using (
    exists (
      select 1 from gigs
      where gigs.id = messages.gig_id
      and gigs.client_id = auth.uid()
    )
    or
    exists (
      select 1 from gigs
      where gigs.id = messages.gig_id
      and gigs.worker_id = auth.uid()
    )
    or
    exists (
      select 1 from applications
      where applications.gig_id = messages.gig_id
      and applications.worker_id = auth.uid()
    )
  );

-- New Policy: Insert messages
-- Same logic as view
create policy "Users can insert messages."
  on messages for insert
  with check (
    exists (
      select 1 from gigs
      where gigs.id = messages.gig_id
      and gigs.client_id = auth.uid()
    )
    or
    exists (
      select 1 from gigs
      where gigs.id = messages.gig_id
      and gigs.worker_id = auth.uid()
    )
    or
    exists (
      select 1 from applications
      where applications.gig_id = messages.gig_id
      and applications.worker_id = auth.uid()
    )
  );
