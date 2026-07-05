
-- Add paid_amount column to invoices for partial payments
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0;

-- Add paid_amount column to quotations for consistency
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0;

-- Create transactions table to track all payment transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id text NOT NULL DEFAULT generate_display_id('TXN'),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL DEFAULT 'income',
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cash',
  reference_type text,
  reference_id uuid,
  reference_number text,
  from_name text,
  to_name text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sequence for transactions
CREATE SEQUENCE IF NOT EXISTS seq_txn START 1;

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS policy for admins
CREATE POLICY "Admins can manage transactions" ON public.transactions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
