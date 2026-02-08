-- CMS / Admin Features

-- 1. Track Views on Gigs
alter table gigs add column if not exists views integer default 0;

-- 2. Site Settings Table for CMS
create table if not exists site_settings (
    id bigint primary key generated always as identity,
    key text unique not null,
    value text,
    label text,
    type text default 'text', -- 'text', 'boolean', 'color'
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Seed initial settings if they don't exist
insert into site_settings (key, value, label, type)
values 
    ('site_banner_text', '', 'Announcement Banner Text', 'text'),
    ('is_maintenance_mode', 'false', 'Maintenance Mode', 'boolean'),
    ('primary_color', '#4f46e5', 'Primary Brand Color', 'color')
on conflict (key) do nothing;

-- 4. Enable RLS on site_settings
alter table site_settings enable row level security;

-- 5. Policies for site_settings
-- Everyone can read stats/settings (public)
create policy "Public settings are viewable by everyone"
    on site_settings for select
    using (true);

-- Only Admin can update
create policy "Admins can update settings"
    on site_settings for update
    using (auth.jwt() ->> 'email' = 'nsjdfmjr@gmail.com');

create policy "Admins can insert settings"
    on site_settings for insert
    with check (auth.jwt() ->> 'email' = 'nsjdfmjr@gmail.com');

-- 6. Add views increment function
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
