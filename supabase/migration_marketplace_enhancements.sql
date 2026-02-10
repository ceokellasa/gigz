-- Add bank_details to professional_profiles
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS bank_details jsonb;

-- Add stats columns to digital_products
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS purchase_count integer DEFAULT 0;

-- Function to increment product view count
CREATE OR REPLACE FUNCTION increment_product_view(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE digital_products
  SET view_count = view_count + 1
  WHERE id = product_id;
END;
$$;

-- Function to increment product purchase count
CREATE OR REPLACE FUNCTION increment_product_purchase(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE digital_products
  SET purchase_count = purchase_count + 1
  WHERE id = product_id;
END;
$$;
