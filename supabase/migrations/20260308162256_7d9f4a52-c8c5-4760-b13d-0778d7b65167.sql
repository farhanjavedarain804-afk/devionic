
-- Create customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  whatsapp text,
  address text,
  city text,
  company text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create service_inquiries table
CREATE TABLE public.service_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  city text,
  address text,
  whatsapp text,
  phone text,
  email text NOT NULL,
  approved_budget text,
  project_timeline text,
  project_description text NOT NULL,
  service_title text,
  attachments text[] DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.service_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit service inquiry" ON public.service_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage service inquiries" ON public.service_inquiries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create testimonials table
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  company text,
  message text NOT NULL,
  rating integer DEFAULT 5,
  is_active boolean DEFAULT true,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit testimonial" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (is_active = true AND is_approved = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create staff table
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  position text NOT NULL,
  department text,
  staff_type text NOT NULL DEFAULT 'permanent',
  salary numeric DEFAULT 0,
  join_date date,
  cnic text,
  bank_account text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage staff" ON public.staff FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create attendance table
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in timestamptz,
  check_out timestamptz,
  status text DEFAULT 'present',
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage attendance" ON public.attendance FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create salary_slips table
CREATE TABLE public.salary_slips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL,
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  basic_salary numeric DEFAULT 0,
  allowances numeric DEFAULT 0,
  deductions numeric DEFAULT 0,
  net_salary numeric DEFAULT 0,
  status text DEFAULT 'draft',
  notes text,
  verification_id text NOT NULL DEFAULT ('SAL-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.salary_slips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage salary slips" ON public.salary_slips FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add customer_id to invoices and quotations
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id);
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id);

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);

-- Storage policies
CREATE POLICY "Anyone can upload attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "Anyone can view attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Admins can delete attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'));

-- Add quote_requests table for Get Quote form
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  budget text,
  timeline text,
  description text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit quote request" ON public.quote_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage quote requests" ON public.quote_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
