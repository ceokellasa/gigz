-- Create a table for fixed-price services offered by professionals
CREATE TABLE IF NOT EXISTS professional_services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid REFERENCES professional_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  price decimal(10, 2) NOT NULL, -- Price in local currency
  delivery_time_days integer DEFAULT 1, -- Estimated delivery time
  image_url text, -- Optional image for the service
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;

-- Policies
-- Drop existing policies if they exist to allow re-running script
DROP POLICY IF EXISTS "Public services are viewable by everyone" ON professional_services;
DROP POLICY IF EXISTS "Professionals can insert their own services" ON professional_services;
DROP POLICY IF EXISTS "Professionals can update their own services" ON professional_services;
DROP POLICY IF EXISTS "Professionals can delete their own services" ON professional_services;

-- Everyone can view services
CREATE POLICY "Public services are viewable by everyone" 
ON professional_services FOR SELECT 
USING (true);

-- Professionals can manage their own services
CREATE POLICY "Professionals can insert their own services" 
ON professional_services FOR INSERT 
WITH CHECK (auth.uid() IN (
    SELECT user_id FROM professional_profiles WHERE id = professional_services.professional_id
));

CREATE POLICY "Professionals can update their own services" 
ON professional_services FOR UPDATE 
USING (auth.uid() IN (
    SELECT user_id FROM professional_profiles WHERE id = professional_services.professional_id
));

CREATE POLICY "Professionals can delete their own services" 
ON professional_services FOR DELETE 
USING (auth.uid() IN (
    SELECT user_id FROM professional_profiles WHERE id = professional_services.professional_id
));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_professional_services_prof_id ON professional_services(professional_id);
