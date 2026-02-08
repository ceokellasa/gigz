-- Allow NULL user_id for global notifications
alter table notifications alter column user_id drop not null;

-- Add is_global flag
alter table notifications add column if not exists is_global boolean default false;

-- Add sender_id (system or admin user)
alter table notifications add column if not exists sender_id uuid references auth.users(id);

-- Drop POTENTIALLY EXISTING policies to avoid conflicts
drop policy if exists "Users can view own notifications" on notifications;
drop policy if exists "Users can view own and global notifications" on notifications;

-- Create new RLS: View own OR global
create policy "Users can view own and global notifications"
on notifications for select
using (
  auth.uid() = user_id 
  or is_global = true
);

-- Fix: Remove restrictive type check that blocks 'system_broadcast'
alter table notifications drop constraint if exists notifications_type_check;
