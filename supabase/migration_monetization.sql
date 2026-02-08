-- Add mobile_number to gigs
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- Add subscription fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND subscription_expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure function to get gig contact info
CREATE OR REPLACE FUNCTION get_gig_contact(gig_id UUID)
RETURNS TEXT AS $$
DECLARE
  is_subscribed BOOLEAN;
  contact_number TEXT;
BEGIN
  -- Check if the caller has an active subscription
  is_subscribed := has_active_subscription(auth.uid());
  
  -- Get the mobile number for the gig
  SELECT mobile_number INTO contact_number
  FROM gigs
  WHERE id = gig_id;

  -- Return number if subscribed, otherwise return NULL (or a masked value if preferred, but NULL is safer)
  -- Also return if the user is the owner of the gig
  IF is_subscribed OR EXISTS (SELECT 1 FROM gigs WHERE id = gig_id AND client_id = auth.uid()) THEN
    RETURN contact_number;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
