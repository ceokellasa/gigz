-- Add contact_for_pricing column to professional_profiles
ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS contact_for_pricing boolean DEFAULT false;
