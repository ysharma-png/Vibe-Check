-- ==============================================================================
-- Storage Buckets & Policies Migration
-- Buckets: avatars, portfolio-media, thumbnails, deliverables
-- ==============================================================================

-- 1. Create Storage Buckets in storage.buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    2097152, -- 2 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  ),
  (
    'portfolio-media',
    'portfolio-media',
    true,
    52428800, -- 50 MB
    array['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'thumbnails',
    'thumbnails',
    true,
    5242880, -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'deliverables',
    'deliverables',
    false, -- Private bucket
    104857600, -- 100 MB
    array['application/zip', 'video/mp4', 'video/quicktime', 'image/png', 'application/json']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage Policies

-- 2.1 Avatars Bucket Policies
create policy "Avatars are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2.2 Portfolio Media Bucket Policies
create policy "Portfolio media is publicly viewable"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

create policy "Authenticated creators can upload portfolio media"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio-media'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Creators can update their portfolio media"
  on storage.objects for update
  using (
    bucket_id = 'portfolio-media'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Creators can delete their portfolio media"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio-media'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2.3 Thumbnails Bucket Policies
create policy "Thumbnails are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'thumbnails');

create policy "Creators can upload thumbnails"
  on storage.objects for insert
  with check (
    bucket_id = 'thumbnails'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Creators can update thumbnails"
  on storage.objects for update
  using (
    bucket_id = 'thumbnails'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Creators can delete thumbnails"
  on storage.objects for delete
  using (
    bucket_id = 'thumbnails'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2.4 Deliverables Bucket Policies (Private: only engagement participants or admin)
create policy "Engagement participants can view deliverables"
  on storage.objects for select
  using (
    bucket_id = 'deliverables'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.engagements e
      where e.id::text = (storage.foldername(name))[1]
        and (e.brand_id = auth.uid() or e.creator_id = auth.uid())
    )
  );

create policy "Engagement participants can upload deliverables"
  on storage.objects for insert
  with check (
    bucket_id = 'deliverables'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.engagements e
      where e.id::text = (storage.foldername(name))[1]
        and (e.brand_id = auth.uid() or e.creator_id = auth.uid())
    )
  );

create policy "Engagement participants can delete deliverables"
  on storage.objects for delete
  using (
    bucket_id = 'deliverables'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.engagements e
      where e.id::text = (storage.foldername(name))[1]
        and (e.brand_id = auth.uid() or e.creator_id = auth.uid())
    )
  );
