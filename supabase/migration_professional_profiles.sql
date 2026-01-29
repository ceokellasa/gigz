-- Drop table if exists to allow clean reset
drop table if exists professional_profiles cascade;

-- Create professional_profiles table
create table if not exists professional_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    
    -- Basic Info
    profession varchar(100) not null,
    bio text,
    age integer,
    years_of_experience integer,
    
    -- Pricing
    hourly_rate decimal(10, 2),
    project_rate_min decimal(10, 2),
    project_rate_max decimal(10, 2),
    currency varchar(3) default 'INR',
    
    -- Skills & Certifications
    skills text[], -- Array of skills
    certifications jsonb, -- Array of {name, issuer, year, file_url}
    
    -- Portfolio
    previous_works jsonb, -- Array of {title, description, images[], year}
    
    -- Availability
    available boolean default true,
    location varchar(255),
    willing_to_travel boolean default false,
    
    -- Social/Contact
    website varchar(255),
    linkedin varchar(255),
    phone varchar(20),
    
    -- Metadata
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    -- Search optimization (populated by trigger)
    search_vector tsvector
);

-- Enable RLS
alter table professional_profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
    on professional_profiles for select
    using (true);

create policy "Users can insert their own profile"
    on professional_profiles for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own profile"
    on professional_profiles for update
    using (auth.uid() = user_id);

create policy "Users can delete their own profile"
    on professional_profiles for delete
    using (auth.uid() = user_id);

-- Create index for search
create index if not exists professional_profiles_search_idx 
    on professional_profiles using gin(search_vector);

-- Create index for profession filtering
create index if not exists professional_profiles_profession_idx 
    on professional_profiles(profession);

-- Create index for user_id
create index if not exists professional_profiles_user_id_idx 
    on professional_profiles(user_id);

-- Function to update updated_at timestamp
create or replace function update_professional_profile_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_professional_profile_updated_at
    before update on professional_profiles
    for each row
    execute function update_professional_profile_updated_at();

-- Function to update search_vector
create or replace function update_professional_profile_search_vector()
returns trigger as $$
begin
    new.search_vector := 
        setweight(to_tsvector('english', coalesce(new.profession, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(new.bio, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(new.skills, ' '), '')), 'C');
    return new;
end;
$$ language plpgsql;

-- Trigger to auto-update search_vector
create trigger update_professional_profile_search_vector
    before insert or update on professional_profiles
    for each row
    execute function update_professional_profile_search_vector();
