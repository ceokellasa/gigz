-- ==========================================
-- FINAL ADMIN & CMS SETUP
-- Run this entire script in Supabase SQL Editor
-- ==========================================

-- 1. Setup 'gigs' table features
alter table gigs add column if not exists views integer default 0;

-- 2. Create 'site_settings' table
create table if not exists site_settings (
    id bigint primary key generated always as identity,
    key text unique not null,
    value text,
    label text,
    type text default 'text', -- 'text', 'boolean', 'color'
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable Security
alter table site_settings enable row level security;

-- 4. Clean up old policies to avoid conflicts
drop policy if exists "Admins can update settings" on site_settings;
drop policy if exists "Admins can insert settings" on site_settings;
drop policy if exists "Public settings are viewable by everyone" on site_settings;
drop policy if exists "Admins can do everything" on site_settings;

-- 5. Create Policies

-- Allow EVERYONE to read settings (needed for site appearance)
create policy "Public settings are viewable by everyone"
    on site_settings for select
    using (true);

-- Allow ADMIN ONLY to insert/update/delete
-- Using case-insensitive email check for safety
create policy "Admins can do everything"
    on site_settings
    for all
    using (lower(auth.jwt() ->> 'email') = 'nsjdfmjr@gmail.com')
    with check (lower(auth.jwt() ->> 'email') = 'nsjdfmjr@gmail.com');

-- 6. Seed Initial Data (only if missing)
insert into site_settings (key, value, label, type)
values 
    ('site_name', 'Kelasa', 'Site Name', 'text'),
    ('site_description', 'Modern Work Marketplace', 'Site Description', 'text'),
    ('primary_color', '#4f46e5', 'Primary Brand Color', 'color'),
    ('hero_headline', 'Build your money future', 'Hero Headline', 'text'),
    ('hero_subheadline', 'Find gigs, get paid, and take control of your earnings.', 'Hero Subheadline', 'text'),
    ('hero_image_url', '/artifacts/fintech_hero_mockup.png', 'Hero Image URL', 'text'),
    ('site_logo_url', '/kelasa-logo.png', 'Logo URL', 'text'),
    ('contact_email', 'support@kelasa.com', 'Contact Email', 'text'),
    ('footer_text', '© 2026 Kelasa, Inc. All rights reserved.', 'Footer Text', 'text'),
    ('is_maintenance_mode', 'false', 'Maintenance Mode', 'boolean'),
    ('site_banner_text', '', 'Announcement Banner', 'text')
on conflict (key) do nothing;

-- 7. Helper Function for View Counting
-- This allows incrementing views securely without giving public write access to the 'gigs' table
create or replace function increment_gig_view(gig_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update gigs
  set views = views + 1
  where id = gig_id;
end;
$$;
