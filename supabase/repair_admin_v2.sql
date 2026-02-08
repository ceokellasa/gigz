-- 1. Ensure KYC Columns Exist
-- Wrap type creation in a DO block to avoid 'already exists' error
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status_enum') THEN
        CREATE TYPE kyc_status_enum AS ENUM ('none', 'pending', 'verified', 'rejected');
    END IF;
END$$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status kyc_status_enum DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_document_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_submitted_at timestamptz;

-- 2. Add created_at column if missing (useful for sorting)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3. FIX RLS POLICIES (This fixes "Failed to load users")
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users and Admins can update profiles" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile AND allow Admins to update (for KYC)
CREATE POLICY "Users and Admins can update profiles" 
ON profiles FOR UPDATE 
USING (
  auth.uid() = id OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Create Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true; 

-- 5. Storage Policies
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
