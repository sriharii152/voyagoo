
-- Create diary_entries table
CREATE TABLE public.diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL DEFAULT '',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  foods TEXT DEFAULT '',
  places TEXT DEFAULT '',
  views_description TEXT DEFAULT '',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can view public entries
CREATE POLICY "Anyone can view public diary entries"
  ON public.diary_entries FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- Owner can insert
CREATE POLICY "Users can insert own diary entries"
  ON public.diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owner can update
CREATE POLICY "Users can update own diary entries"
  ON public.diary_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Owner can delete
CREATE POLICY "Users can delete own diary entries"
  ON public.diary_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create diary_media table for photos, videos, voice recordings
CREATE TABLE public.diary_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.diary_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  caption TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.diary_media ENABLE ROW LEVEL SECURITY;

-- Media visibility follows parent entry
CREATE POLICY "Media visible if entry is visible"
  ON public.diary_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.diary_entries de
      WHERE de.id = entry_id AND (de.is_public = true OR de.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert own media"
  ON public.diary_media FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media"
  ON public.diary_media FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for diary media
INSERT INTO storage.buckets (id, name, public) VALUES ('diary-media', 'diary-media', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload diary media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'diary-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view diary media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'diary-media');

CREATE POLICY "Users can delete own diary media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'diary-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Trigger for updated_at
CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for public feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.diary_entries;
