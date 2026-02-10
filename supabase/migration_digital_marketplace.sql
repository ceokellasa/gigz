-- Create digital_products table
CREATE TABLE IF NOT EXISTS digital_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  category text NOT NULL CHECK (category IN ('template', 'ebook', 'code', 'art', 'other')),
  cover_image_url text,
  file_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_purchases table
CREATE TABLE IF NOT EXISTS product_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id uuid REFERENCES auth.users(id) NOT NULL,
  product_id uuid REFERENCES digital_products(id) NOT NULL,
  amount_paid numeric NOT NULL,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  UNIQUE(buyer_id, product_id)
);

-- Enable RLS
ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public view products" ON digital_products;
DROP POLICY IF EXISTS "Professionals insert own products" ON digital_products;
DROP POLICY IF EXISTS "Professionals update own products" ON digital_products;
DROP POLICY IF EXISTS "Professionals delete own products" ON digital_products;
DROP POLICY IF EXISTS "Buyers view own purchases" ON product_purchases;
DROP POLICY IF EXISTS "Sellers view sales" ON product_purchases;
DROP POLICY IF EXISTS "Users insert purchases" ON product_purchases;

-- Policies for digital_products
CREATE POLICY "Public view products" ON digital_products FOR SELECT USING (true);

CREATE POLICY "Professionals insert own products" ON digital_products FOR INSERT WITH CHECK (
  auth.uid() = professional_id
);

CREATE POLICY "Professionals update own products" ON digital_products FOR UPDATE USING (
  auth.uid() = professional_id
);

CREATE POLICY "Professionals delete own products" ON digital_products FOR DELETE USING (
  auth.uid() = professional_id
);

-- Policies for product_purchases
CREATE POLICY "Buyers view own purchases" ON product_purchases FOR SELECT USING (
  auth.uid() = buyer_id
);

CREATE POLICY "Sellers view sales" ON product_purchases FOR SELECT USING (
  auth.uid() IN (
    SELECT professional_id FROM digital_products WHERE id = product_purchases.product_id
  )
);

CREATE POLICY "Users insert purchases" ON product_purchases FOR INSERT WITH CHECK (
  auth.uid() = buyer_id
);
