-- Allow Admins to Delete and Update ANY Gig
-- Run this in Supabase SQL Editor

-- 1. Admin Delete Policy
drop policy if exists "Admins can delete any gig" on gigs;
create policy "Admins can delete any gig"
on gigs
for delete
using (lower(auth.jwt() ->> 'email') = 'nsjdfmjr@gmail.com');

-- 2. Admin Update Policy
drop policy if exists "Admins can update any gig" on gigs;
create policy "Admins can update any gig"
on gigs
for update
using (lower(auth.jwt() ->> 'email') = 'nsjdfmjr@gmail.com');
