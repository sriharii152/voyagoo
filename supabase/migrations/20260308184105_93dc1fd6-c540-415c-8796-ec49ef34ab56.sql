
-- Likes table
CREATE TABLE public.diary_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.diary_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entry_id, user_id)
);

ALTER TABLE public.diary_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.diary_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.diary_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.diary_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE public.diary_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.diary_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.diary_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on public entries" ON public.diary_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM diary_entries de WHERE de.id = diary_comments.entry_id AND (de.is_public = true OR de.user_id = auth.uid()))
);
CREATE POLICY "Users can insert own comments" ON public.diary_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.diary_comments FOR DELETE USING (auth.uid() = user_id);
