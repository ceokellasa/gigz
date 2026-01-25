-- PHOTO SHARING SUPPORT

-- 1. Add attachment columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT DEFAULT 'image';

-- 2. Create Storage Bucket for Chat Attachments
-- Note: This requires the storage schema to be active
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies (RLS)

-- Enable RLS on objects if not already enabled (usually is by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload (INSERT) files to 'chat-attachments'
-- We restrict the path to be associated with a valid gig (optional, but good for security)
-- For simplicity: Allow any authenticated user to upload
DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.role() = 'authenticated'
);

-- Allow public (or authenticated) access to view (SELECT) files
-- Since we made the bucket public, public URL access works.
-- But if accessing via API:
DROP POLICY IF EXISTS "Anyone can view chat attachments" ON storage.objects;
CREATE POLICY "Anyone can view chat attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

-- Allow users to update/delete their own files (Optional)
DROP POLICY IF EXISTS "Users can delete their own chat attachments" ON storage.objects;
CREATE POLICY "Users can delete their own chat attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-attachments' 
  AND auth.uid() = owner
);
