-- 1. Make gig_id nullable to support DMs and Support Chats
ALTER TABLE messages ALTER COLUMN gig_id DROP NOT NULL;

-- 2. Update the 'fetch conversations' query policy logic if needed
-- (The permissive policies I added earlier already cover sender/receiver auth, so RLS is fine)

-- 3. We might need to ensure the Admin User exists and is queryable ?
-- The frontend is finding the admin by email. That's fine.

-- 4. Allow NULL gig_id in indexes ?
-- Standard B-TREE handles nulls, no changes needed.
