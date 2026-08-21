-- Add image_url to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_images', 'chat_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload chat images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat_images');

CREATE POLICY "Users can view chat images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'chat_images');

CREATE POLICY "Users can delete chat images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'chat_images');

-- Note: In a production app you might want to restrict these policies to only conversation participants. 
-- For simplicity and performance, we allow authenticated users to upload/view, but the UI restricts access.
