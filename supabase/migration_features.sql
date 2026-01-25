-- Add new columns to profiles table
alter table profiles add column if not exists location text;
alter table profiles add column if not exists skills text[];
alter table profiles add column if not exists bio text;

-- Add new columns to gigs table
alter table gigs add column if not exists location text;
alter table gigs add column if not exists is_remote boolean default false;
alter table gigs add column if not exists required_skills text[];
alter table gigs add column if not exists image_url text;

-- Create an index for faster searching
create index if not exists gigs_location_idx on gigs(location);
create index if not exists gigs_skills_idx on gigs using gin(required_skills);
