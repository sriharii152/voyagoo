
-- Create storage bucket for connect voice messages
INSERT INTO storage.buckets (id, name, public) VALUES ('connect-media', 'connect-media', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload connect media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'connect-media' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view connect media" ON storage.objects
  FOR SELECT USING (bucket_id = 'connect-media');

CREATE POLICY "Users can delete own connect media" ON storage.objects
  FOR DELETE USING (bucket_id = 'connect-media' AND auth.uid()::text = (storage.foldername(name))[1]);
