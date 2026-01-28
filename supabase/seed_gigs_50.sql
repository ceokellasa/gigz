-- update_budget_type_enum.sql
-- Allow 'monthly' in budget_type constraint
ALTER TABLE gigs DROP CONSTRAINT IF EXISTS gigs_budget_type_check;
ALTER TABLE gigs ADD CONSTRAINT gigs_budget_type_check CHECK (budget_type IN ('fixed', 'hourly', 'monthly'));

-- Ensure mobile_number exists
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS mobile_number text;

-- Seed Data
DO $$
DECLARE
  client_user_id uuid;
  i integer;
  titles text[] := ARRAY[
    'Sales Associate Needed - Urgent', 'Senior Python Developer', 'Car Mechanic Required', 'Plumber for Home Repair', 'Office Electrical Wiring',
    'Digital Marketing Expert', 'Logo Design Project', 'Blog Content Writer', 'Data Entry & Admin', 'React Native App Developer',
    'Regional Sales Manager', 'Bike Services Mechanic', 'AC Repair Specialist', 'Furniture Carpenter', 'House Painter Needed',
    'Yoga Instructor (Morning)', 'Math Tutor - Class 10', 'Wedding Photographer', 'Event Planner Assistant', 'Social Media Strategist',
    'Driver for Family Car', 'Security Guard (Night Shift)', 'Home Nurse for Elderly', 'Cook for Indian Meals', 'Gardener for Maintenance',
    'Receptionist for Clinic', 'Delivery Boy - Part Time', 'Warehouse Helper', 'Gym Trainer', 'Beautician for Home Service',
    'GST Filing Accountant', 'Video Editor for YouTube', 'SEO Specialist', 'Translation (Hindi to English)', 'Customer Support exec'
  ];
  descriptions text[] := ARRAY[
    'Looking for an experienced professional to join our team immediately. Good growth potential.',
    'Need a skilled freelancer for a short-term project. High pay for quality work. Remote possible.',
    'Urgent requirement for on-site work. Please contact if you are available.',
    'We are expanding and looking for dedicated individuals to join our growing business.',
    'Simple task, can be done in a few hours. Immediate payment upon completion.',
    'Looking for someone reliable with at least 2 years of experience in the field.'
  ];
  categories text[] := ARRAY[
    'Sales', 'Technical', 'Mechanic', 'Plumber', 'Electrician', 
    'Design', 'Writing', 'Marketing', 'Education', 'Construction',
    'Driver', 'Security', 'Health', 'Household', 'Beauty'
  ];
  locs text[] := ARRAY['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Mysore', 'Kolkata', 'Ahmedabad', 'Jaipur'];
  -- Lat/Lng corresponding to locs roughly
  lats float[] := ARRAY[12.9716, 19.0760, 28.7041, 13.0827, 17.3850, 18.5204, 12.2958, 22.5726, 23.0225, 26.9124];
  lngs float[] := ARRAY[77.5946, 72.8777, 77.1025, 80.2707, 78.4867, 73.8567, 76.6394, 88.3639, 72.5714, 75.7873];
  phones text[] := ARRAY['7259398790', '9380638790', '6360104814', '6363661200', '8296661200'];
  budgets text[] := ARRAY['15000', '25000', '45000', '500', '1200', '800', '30000', '20000', '1000', '300'];
  b_types text[] := ARRAY['monthly', 'monthly', 'monthly', 'fixed', 'fixed', 'hourly', 'monthly', 'monthly', 'fixed', 'hourly'];
  
  -- Variables for loop
  chosen_title text;
  chosen_cat text;
  chosen_loc_idx int;
  chosen_phone text;
  chosen_budget text;
  chosen_b_type text;
BEGIN
  -- Get a valid client ID (Admin or any user)
  SELECT id INTO client_user_id FROM profiles LIMIT 1;
  IF client_user_id IS NULL THEN
     RAISE NOTICE 'No profiles found. Skipping insert.';
     RETURN;
  END IF;

  FOR i IN 1..50 LOOP
    chosen_title := titles[1 + (i % array_length(titles, 1))];
    chosen_cat := categories[1 + (i % array_length(categories, 1))];
    chosen_loc_idx := 1 + (i % array_length(locs, 1));
    chosen_phone := phones[1 + (i % array_length(phones, 1))];
    chosen_budget := budgets[1 + (i % array_length(budgets, 1))];
    chosen_b_type := b_types[1 + (i % array_length(b_types, 1))];

    INSERT INTO gigs (
      title,
      description,
      category,
      budget,
      budget_type,
      location,
      latitude,
      longitude,
      mobile_number,
      client_id,
      status,
      created_at,
      deadline,
      is_remote
    ) VALUES (
      chosen_title,
      descriptions[1 + (i % array_length(descriptions, 1))],
      chosen_cat,
      chosen_budget::numeric, -- Ensure numeric if column is numeric
      chosen_b_type,
      locs[chosen_loc_idx],
      lats[chosen_loc_idx] + ((random() - 0.5) * 0.1), -- Jitter ~10km
      lngs[chosen_loc_idx] + ((random() - 0.5) * 0.1),
      chosen_phone,
      client_user_id,
      'open',
      NOW() - (random() * interval '10 days'),
      NOW() + (random() * interval '30 days'),
      (i % 5 = 0) -- 20% remote
    );
  END LOOP;
END $$;
