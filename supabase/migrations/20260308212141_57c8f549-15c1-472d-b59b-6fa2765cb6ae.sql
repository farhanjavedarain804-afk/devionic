
-- Page views / visitor tracking
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  ip_address text,
  country text,
  city text,
  device text,
  browser text,
  os text,
  page_path text NOT NULL,
  referrer text,
  user_agent text,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Visitor sessions for online tracking
CREATE TABLE public.visitor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  ip_address text,
  country text,
  city text,
  device text,
  browser text,
  os text,
  started_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  is_online boolean DEFAULT true,
  pages_visited integer DEFAULT 1
);

-- Admin activity logs
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  details text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert page views (anonymous tracking)
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view page views" ON public.page_views FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Anyone can manage own session
CREATE POLICY "Anyone can insert sessions" ON public.visitor_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.visitor_sessions FOR UPDATE USING (true);
CREATE POLICY "Admins can view sessions" ON public.visitor_sessions FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Admin logs
CREATE POLICY "Admins can manage logs" ON public.admin_logs FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert logs" ON public.admin_logs FOR INSERT WITH CHECK (true);

-- Enable realtime for visitor_sessions to track online users
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_sessions;
