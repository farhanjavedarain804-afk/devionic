
CREATE TABLE public.complaint_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text NOT NULL,
  attachments text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.complaint_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage complaint notes" ON public.complaint_notes
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view complaint notes" ON public.complaint_notes
  FOR SELECT TO anon, authenticated USING (true);
