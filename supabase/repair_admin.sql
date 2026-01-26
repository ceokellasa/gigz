-- 1. Ensure KYC Columns Exist (Run this just in case)
CREATE TYPE kyc_status_enum AS ENUM ('none', 'pending', 'verified', 'rejected');
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status kyc_status_enum DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_document_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_submitted_at timestamptz;

-- 2. Add created_at column if missing (useful for sorting)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3. FIX RLS POLICIES (This fixes "Failed to load users")
-- First, drop the old restrictive policies to be clean
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Re-create them robustly
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile." 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile AND allow Admins to update (for KYC)
-- Since we can't easily check 'admin' role in RLS without recursion, 
-- we will use a simpler policy: Users can update their own, AND anyone with role='admin' can update anyone.
-- Note: This requires the current user to have role='admin' in their profile.
CREATE POLICY "Users and Admins can update profiles" 
ON profiles FOR UPDATE 
USING (
  auth.uid() = id OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Set your user as Admin (IMPORTANT: Replace with your email if needed, but this tries to find it)
-- Since we can't filter by email in profiles easily (no email col), 
-- you must manually update your row in table editor or use:
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID'; 

-- 5. Create Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true; 
-- Note: Made public=true for easier Admin viewing in this MVP

-- 6. Storage Policies
DROP POLICY IF EXISTS "Users can upload own KYC document" ON storage.objects;
CREATE POLICY "Users can upload own KYC document"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text );

DROP POLICY IF EXISTS "Anyone can view KYC documents" ON storage.objects;
CREATE POLICY "Anyone can view KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'kyc-documents' );
