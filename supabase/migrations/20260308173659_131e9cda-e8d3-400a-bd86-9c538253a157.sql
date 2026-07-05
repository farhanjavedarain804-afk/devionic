
CREATE TABLE public.financials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL DEFAULT 'income',
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  reference_type text DEFAULT NULL,
  reference_id uuid DEFAULT NULL,
  reference_number text DEFAULT NULL,
  notes text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage financials"
  ON public.financials FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-add financial entry when invoice is marked as paid
CREATE OR REPLACE FUNCTION public.auto_add_invoice_financial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid') THEN
    INSERT INTO public.financials (entry_date, type, category, description, amount, reference_type, reference_id, reference_number)
    VALUES (
      CURRENT_DATE,
      'income',
      'Invoice Payment',
      'Payment received for ' || NEW.invoice_number || ' from ' || NEW.client_name,
      NEW.total,
      'invoice',
      NEW.id,
      NEW.invoice_number
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_invoice_paid
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_invoice_financial();
