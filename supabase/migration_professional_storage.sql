-- Create a new storage bucket for professional assets if it doesn't exist
insert into storage.buckets (id, name, public)
values ('professional_assets', 'professional_assets', true)
on conflict (id) do nothing;

-- Set up security policies for the bucket

-- 1. Allow public access to view images
create policy "Give public access to professional assets"
on storage.objects for select
using ( bucket_id = 'professional_assets' );

-- 2. Allow authenticated users to upload images
create policy "Allow authenticated users to upload attributes"
on storage.objects for insert
with check (
  bucket_id = 'professional_assets'
  and auth.role() = 'authenticated'
);

-- 3. Allow users to update/delete their own images
create policy "Users can update own images"
on storage.objects for update
using ( auth.uid() = owner )
with check ( bucket_id = 'professional_assets' );

create policy "Users can delete own images"
on storage.objects for delete
using ( auth.uid() = owner and bucket_id = 'professional_assets' );
