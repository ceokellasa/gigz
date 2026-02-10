-- Create storage buckets for Digital Marketplace
-- Note: 'product-covers' is public (for viewing), 'digital-products' is private (for secure downloads)

-- 1. Insert Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-covers', 'product-covers', true),
  ('digital-products', 'digital-products', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Clean Up Old Policies (to prevent conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public covers" ON storage.objects;
DROP POLICY IF EXISTS "Auth products" ON storage.objects;

-- 3. Create RLS Policies for Storage

-- Policy: Allow Authenticated Users to Upload Files (to both buckets)
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id IN ('product-covers', 'digital-products'));

-- Policy: Allow Public to View Covers
CREATE POLICY "Public covers" ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'product-covers');

-- Policy: Allow Authenticated Users to Download Products
-- (Secured by Signed URL generation logic in backend, filtering by purchase)
CREATE POLICY "Auth products" ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'digital-products');
