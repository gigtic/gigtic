-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('gig-images', 'gig-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies on gig-images if any to start fresh
DROP POLICY IF EXISTS "Anyone can view gig-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gig-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own gig-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own gig-images" ON storage.objects;

-- 1. Allow public read access to the bucket
CREATE POLICY "Anyone can view gig-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gig-images');

-- 2. Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload gig-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gig-images');

-- 3. Allow users to update their own files
CREATE POLICY "Users can update their own gig-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gig-images' AND auth.uid() = owner);

-- 4. Allow users to delete their own files
CREATE POLICY "Users can delete their own gig-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gig-images' AND auth.uid() = owner);
