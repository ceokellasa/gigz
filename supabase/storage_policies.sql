-- Create storage buckets if they don't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gig-images', 'gig-images', true)
on conflict (id) do nothing;

-- Policy: Avatars are publicly accessible
create policy "Avatars are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy: Users can upload their own avatar
create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.uid() = owner );

-- Policy: Users can update their own avatar
create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- Policy: Gig images are publicly accessible
create policy "Gig images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'gig-images' );

-- Policy: Authenticated users can upload gig images
create policy "Authenticated users can upload gig images."
  on storage.objects for insert
  with check ( bucket_id = 'gig-images' and auth.role() = 'authenticated' );

-- Policy: Users can update their own gig images
create policy "Users can update their own gig images."
  on storage.objects for update
  using ( bucket_id = 'gig-images' and auth.uid() = owner );
