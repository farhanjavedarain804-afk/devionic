
-- Bookings table
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id text NOT NULL DEFAULT generate_display_id('BKG'),
  title text NOT NULL,
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  service text,
  description text,
  status text NOT NULL DEFAULT 'confirmed',
  booking_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric DEFAULT 0,
  source text DEFAULT 'manual',
  reference_type text,
  reference_id uuid,
  reference_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Feedback calls table
CREATE TABLE public.feedback_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id text NOT NULL DEFAULT generate_display_id('FBC'),
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  project_reference text,
  q1_rating integer DEFAULT 0,
  q2_rating integer DEFAULT 0,
  q3_rating integer DEFAULT 0,
  q4_rating integer DEFAULT 0,
  q5_rating integer DEFAULT 0,
  q1_text text DEFAULT 'How satisfied are you with the overall service?',
  q2_text text DEFAULT 'How would you rate the communication?',
  q3_text text DEFAULT 'How would you rate the quality of work?',
  q4_text text DEFAULT 'How likely are you to recommend us?',
  q5_text text DEFAULT 'How satisfied are you with the timeline?',
  total_score integer DEFAULT 0,
  notes text,
  called_by text,
  call_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.feedback_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feedback calls" ON public.feedback_calls FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Create sequences for new display IDs
CREATE SEQUENCE IF NOT EXISTS seq_bkg START 1;
CREATE SEQUENCE IF NOT EXISTS seq_fbc START 1;

-- Auto-create booking when quotation is approved
CREATE OR REPLACE FUNCTION public.auto_create_booking_from_quotation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.bookings (title, client_name, client_email, client_phone, service, amount, source, reference_type, reference_id, reference_number)
    VALUES (
      'Quotation ' || NEW.quotation_number,
      NEW.client_name,
      NEW.client_email,
      NEW.client_phone,
      'Quotation Service',
      NEW.total,
      'quotation',
      'quotation',
      NEW.id,
      NEW.quotation_number
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_from_quotation
  AFTER UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_booking_from_quotation();

-- Auto-create booking when invoice is sent
CREATE OR REPLACE FUNCTION public.auto_create_booking_from_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'sent' AND (OLD.status IS DISTINCT FROM 'sent') THEN
    INSERT INTO public.bookings (title, client_name, client_email, client_phone, amount, source, reference_type, reference_id, reference_number)
    VALUES (
      'Invoice ' || NEW.invoice_number,
      NEW.client_name,
      NEW.client_email,
      NEW.client_phone,
      NEW.total,
      'invoice',
      'invoice',
      NEW.id,
      NEW.invoice_number
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_from_invoice
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_booking_from_invoice();
