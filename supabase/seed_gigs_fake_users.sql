-- DATA CLEANUP & SEEDING SCRIPT
-- 1. DELETE previous test data (optional, remove this block if you want to keep them)
DELETE FROM gigs WHERE description IN (
    'Looking for an experienced professional to join our team immediately. Good growth potential.',
    'Need a skilled freelancer for a short-term project. High pay for quality work. Remote possible.',
    'Urgent requirement for on-site work. Please contact if you are available.',
    'We are expanding and looking for dedicated individuals to join our growing business.',
    'Simple task, can be done in a few hours. Immediate payment upon completion.',
    'Looking for someone reliable with at least 2 years of experience in the field.'
);

-- 2. CREATE FAKE PROFILES (Ghost Profiles)
-- We use a DO block to generate them. They won't have login access (auth.users) but will display fine.
DO $$
DECLARE
  new_id uuid;
  names text[] := ARRAY[
    'Rahul Sharma', 'Priya Enterprises', 'TechFlow Solutions', 'Amit Verma', 'GreenLeaf Landscaping', 
    'Cornerstone Construction', 'Anita Desai', 'Urban Company (Agent)', 'QuickFix Mechanics', 'Suresh Reddy',
    'Creative Pulse Agency', 'Dr. Neha Gupta', 'BuildRight Infra', 'Karthik Nair', 'Zoom Logistics'
  ];
  avatars text[] := ARRAY[
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    'https://api.dicebear.com/7.x/initials/svg?seed=PE',
    'https://api.dicebear.com/7.x/identicon/svg?seed=TF',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
    'https://api.dicebear.com/7.x/initials/svg?seed=GL',
    'https://api.dicebear.com/7.x/initials/svg?seed=CC',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita',
    'https://api.dicebear.com/7.x/initials/svg?seed=UC',
    'https://api.dicebear.com/7.x/identicon/svg?seed=QM',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh',
    'https://api.dicebear.com/7.x/initials/svg?seed=CP',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha',
    'https://api.dicebear.com/7.x/initials/svg?seed=BR',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik',
    'https://api.dicebear.com/7.x/initials/svg?seed=ZL'
  ];
  profile_ids uuid[];
  i integer;
BEGIN
  -- We need to drop the FK constraint temporarily to allow profiles without auth.users
  -- WARNING: This is a dev-only hack. Ideally, you create real users.
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

  FOR i IN 1..array_length(names, 1) LOOP
    new_id := uuid_generate_v4();
    INSERT INTO profiles (id, full_name, avatar_url, role)
    VALUES (new_id, names[i], avatars[i], 'client');
    
    profile_ids := array_append(profile_ids, new_id);
  END LOOP;

  -- 3. RE-INSERT GIGS WITH RANDOM PROFILES
  DECLARE
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
      lats float[] := ARRAY[12.9716, 19.0760, 28.7041, 13.0827, 17.3850, 18.5204, 12.2958, 22.5726, 23.0225, 26.9124];
      lngs float[] := ARRAY[77.5946, 72.8777, 77.1025, 80.2707, 78.4867, 73.8567, 76.6394, 88.3639, 72.5714, 75.7873];
      phones text[] := ARRAY['7259398790', '9380638790', '6360104814', '6363661200', '8296661200'];
      budgets text[] := ARRAY['15000', '25000', '45000', '500', '1200', '800', '30000', '20000', '1000', '300'];
      b_types text[] := ARRAY['monthly', 'monthly', 'monthly', 'fixed', 'fixed', 'hourly', 'monthly', 'monthly', 'fixed', 'hourly'];
      
      chosen_title text;
      chosen_cat text;
      chosen_loc_idx int;
      chosen_phone text;
      chosen_budget text;
      chosen_b_type text;
      chosen_client_id uuid;
  BEGIN
    FOR i IN 1..50 LOOP
        chosen_title := titles[1 + (i % array_length(titles, 1))];
        chosen_cat := categories[1 + (i % array_length(categories, 1))];
        chosen_loc_idx := 1 + (i % array_length(locs, 1));
        chosen_phone := phones[1 + (i % array_length(phones, 1))];
        chosen_budget := budgets[1 + (i % array_length(budgets, 1))];
        chosen_b_type := b_types[1 + (i % array_length(b_types, 1))];
        
        -- Pick a random Fake Profile ID
        chosen_client_id := profile_ids[1 + floor(random() * array_length(profile_ids, 1))::int];

        INSERT INTO gigs (
          title, description, category, budget, budget_type, location, 
          latitude, longitude, mobile_number, client_id, status, created_at, deadline, is_remote
        ) VALUES (
          chosen_title,
          descriptions[1 + (i % array_length(descriptions, 1))],
          chosen_cat,
          chosen_budget::numeric, 
          chosen_b_type,
          locs[chosen_loc_idx],
          lats[chosen_loc_idx] + ((random() - 0.5) * 0.1),
          lngs[chosen_loc_idx] + ((random() - 0.5) * 0.1),
          chosen_phone,
          chosen_client_id,
          'open',
          NOW() - (random() * interval '10 days'),
          NOW() + (random() * interval '30 days'),
          (i % 5 = 0)
        );
    END LOOP;
  END;
END $$;
