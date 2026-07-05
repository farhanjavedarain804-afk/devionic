
-- Sequence for application numbers (must come first)
CREATE SEQUENCE IF NOT EXISTS public.job_app_seq START 1;

-- Job Applications table
CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number text NOT NULL DEFAULT ('APP-' || lpad((nextval('public.job_app_seq'::regclass))::text, 4, '0')),
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_title text NOT NULL DEFAULT '',
  full_name text NOT NULL,
  father_husband_name text,
  cnic text NOT NULL,
  bform_number text,
  age integer,
  date_of_birth date,
  city text,
  tehsil text,
  district text,
  province text,
  nationality text DEFAULT 'Pakistani',
  postal_address text,
  permanent_address text,
  email text NOT NULL,
  phone1 text,
  phone2 text,
  whatsapp text,
  emergency_contact_number text,
  emergency_contact_whatsapp text,
  emergency_contact_name text,
  emergency_contact_relation text,
  education text,
  work_experience text,
  cnic_doc text,
  resume_cv text,
  experience_letter text,
  educational_docs text,
  other_docs text,
  passport_photo text,
  status text NOT NULL DEFAULT 'pending',
  verification_id text NOT NULL DEFAULT ('EMP-' || upper(substr((gen_random_uuid())::text, 1, 12))),
  employee_id text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can submit application" ON public.job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can check application status" ON public.job_applications FOR SELECT USING (true);
CREATE POLICY "Admins can manage applications" ON public.job_applications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) VALUES ('job-applications', 'job-applications', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload application docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job-applications');
CREATE POLICY "Anyone can view application docs" ON storage.objects FOR SELECT USING (bucket_id = 'job-applications');
CREATE POLICY "Admins can delete application docs" ON storage.objects FOR DELETE USING (bucket_id = 'job-applications');
