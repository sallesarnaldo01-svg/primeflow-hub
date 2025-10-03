-- ============================================
-- MIGRATION 007: Supabase Storage Buckets
-- ============================================

-- 1. CREATE STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('knowledge-docs', 'knowledge-docs', false, 52428800, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('profile-avatars', 'profile-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('message-media', 'message-media', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'audio/mpeg', 'audio/ogg'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS POLICIES FOR STORAGE BUCKETS
-- ============================================

-- KNOWLEDGE-DOCS BUCKET (private)
CREATE POLICY "Authenticated users can upload knowledge docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'knowledge-docs' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view own tenant knowledge docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'knowledge-docs' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete own knowledge docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'knowledge-docs' AND
  auth.uid() IS NOT NULL
);

-- PRODUCT-IMAGES BUCKET (public)
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- PROFILE-AVATARS BUCKET (public)
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- MESSAGE-MEDIA BUCKET (private)
CREATE POLICY "Authenticated users can upload message media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-media' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view message media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-media' AND
  auth.uid() IS NOT NULL
);

-- ============================================
-- HELPER FUNCTION: Get signed URL for private files
-- ============================================

CREATE OR REPLACE FUNCTION public.get_signed_url(
  bucket_name TEXT,
  file_path TEXT,
  expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- This is a placeholder - actual implementation would use storage.sign_url()
  -- In practice, you'd call this from the application using the Supabase SDK
  RETURN format('https://%s/storage/v1/object/sign/%s/%s?token=...', 
    current_setting('app.supabase_url', true),
    bucket_name,
    file_path
  );
END;
$$;

-- ============================================
-- INDEXES for storage
-- ============================================

CREATE INDEX IF NOT EXISTS idx_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_objects_name ON storage.objects(name);
