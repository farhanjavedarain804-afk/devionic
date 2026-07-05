
-- Add status column to quote_requests
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Create projects table
CREATE SEQUENCE IF NOT EXISTS seq_prj START 1;

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id text NOT NULL DEFAULT generate_display_id('PRJ'),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning',
  milestones jsonb DEFAULT '[]'::jsonb,
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
