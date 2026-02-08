-- Create KYC Status Enum
CREATE TYPE kyc_status_enum AS ENUM ('none', 'pending', 'verified', 'rejected');

-- Add KYC columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status kyc_status_enum DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_document_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_submitted_at timestamptz;

-- Create Storage Bucket for KYC Documents (Private)
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- 1. Users can upload their own KYC document
CREATE POLICY "Users can upload own KYC document"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text );

-- 2. Users can view their own KYC document
CREATE POLICY "Users can view own KYC document"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text );

-- 3. Admins can view all (assuming admin policy exists or we'll add one)
-- For now, let's keep it restricted to owner. Admin features usually bypass RLS with service role or special admin role check.
