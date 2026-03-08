
-- Trip itinerary items table
CREATE TABLE public.trip_itinerary_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trip_id UUID REFERENCES public.saved_trips(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  time TEXT NOT NULL DEFAULT '12:00',
  day_number INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_itinerary_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own itinerary items" ON public.trip_itinerary_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own itinerary items" ON public.trip_itinerary_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own itinerary items" ON public.trip_itinerary_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own itinerary items" ON public.trip_itinerary_items FOR DELETE USING (auth.uid() = user_id);

-- Budget expenses table
CREATE TABLE public.budget_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trip_id UUID REFERENCES public.saved_trips(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses" ON public.budget_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.budget_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.budget_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.budget_expenses FOR DELETE USING (auth.uid() = user_id);

-- Saved events table
CREATE TABLE public.saved_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_title TEXT NOT NULL,
  event_location TEXT NOT NULL DEFAULT '',
  event_date TEXT NOT NULL DEFAULT '',
  event_time TEXT NOT NULL DEFAULT '',
  event_category TEXT NOT NULL DEFAULT 'General',
  event_price TEXT NOT NULL DEFAULT 'Free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved events" ON public.saved_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved events" ON public.saved_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved events" ON public.saved_events FOR DELETE USING (auth.uid() = user_id);

-- User activities/adventures table
CREATE TABLE public.saved_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL DEFAULT 'Adventure',
  destination TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  estimated_cost NUMERIC DEFAULT 0,
  duration TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON public.saved_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.saved_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON public.saved_activities FOR DELETE USING (auth.uid() = user_id);
