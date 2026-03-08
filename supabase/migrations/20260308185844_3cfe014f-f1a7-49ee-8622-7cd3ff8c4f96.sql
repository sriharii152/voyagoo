
-- Connect Groups table
CREATE TABLE public.connect_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  group_type text NOT NULL DEFAULT 'custom',
  created_by uuid NOT NULL,
  trip_id uuid REFERENCES public.saved_trips(id) ON DELETE SET NULL,
  invite_code text UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connect_groups ENABLE ROW LEVEL SECURITY;

-- Group Members table
CREATE TABLE public.connect_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.connect_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.connect_group_members ENABLE ROW LEVEL SECURITY;

-- Messages table (text + voice)
CREATE TABLE public.connect_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.connect_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text DEFAULT '',
  message_type text NOT NULL DEFAULT 'text',
  file_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connect_messages ENABLE ROW LEVEL SECURITY;

-- Location sharing table
CREATE TABLE public.connect_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.connect_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  is_sharing boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.connect_locations ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages and locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.connect_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connect_locations;

-- Security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connect_group_members
    WHERE user_id = _user_id AND group_id = _group_id
  )
$$;

-- RLS: connect_groups
CREATE POLICY "Members can view their groups" ON public.connect_groups
  FOR SELECT USING (public.is_group_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create groups" ON public.connect_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update group" ON public.connect_groups
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete group" ON public.connect_groups
  FOR DELETE USING (auth.uid() = created_by);

-- RLS: connect_group_members
CREATE POLICY "Members can view group members" ON public.connect_group_members
  FOR SELECT USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Users can join groups" ON public.connect_group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.connect_group_members
  FOR DELETE USING (auth.uid() = user_id);

-- RLS: connect_messages
CREATE POLICY "Members can view messages" ON public.connect_messages
  FOR SELECT USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Members can send messages" ON public.connect_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Users can delete own messages" ON public.connect_messages
  FOR DELETE USING (auth.uid() = user_id);

-- RLS: connect_locations
CREATE POLICY "Members can view locations" ON public.connect_locations
  FOR SELECT USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Members can share location" ON public.connect_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Users can update own location" ON public.connect_locations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can stop sharing" ON public.connect_locations
  FOR DELETE USING (auth.uid() = user_id);
