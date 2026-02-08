-- CMS Fixes and Policy Updates

-- Ensure table exists
create table if not exists site_settings (
    id bigint primary key generated always as identity,
    key text unique not null,
    value text,
    label text,
    type text default 'text',
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table site_settings enable row level security;

-- Drop existing restricted policies to replace them
drop policy if exists "Admins can update settings" on site_settings;
drop policy if exists "Admins can insert settings" on site_settings;
drop policy if exists "Public settings are viewable by everyone" on site_settings;

-- 1. Everyone can read (Public)
create policy "Public settings are viewable by everyone"
    on site_settings for select
    using (true);

-- 2. Admin Super Access (ALL actions: insert, update, delete)
-- Using lower() to be case-insensitive just in case
create policy "Admins can do everything"
    on site_settings
    for all
    using (lower(auth.jwt() ->> 'email') = 'nsjdfmjr@gmail.com')
    with check (lower(auth.jwt() ->> 'email') = 'nsjdfmjr@gmail.com');

-- 3. Seed default data if missing
insert into site_settings (key, value, label, type)
values 
    ('site_name', 'Kelasa', 'Site Name', 'text'),
    ('primary_color', '#4f46e5', 'Primary Color', 'color'),
    ('hero_headline', 'Build your money future', 'Hero Headline', 'text')
on conflict (key) do nothing;
