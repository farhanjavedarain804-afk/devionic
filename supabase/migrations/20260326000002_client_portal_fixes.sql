-- Add email column to testimonials for better filtering
ALTER TABLE public.testimonials ADD COLUMN email text;

-- Update financials table to ensure we can filter by client email if reference_type is customer
-- (reference_id is already text, we will store email there for customer transactions)

-- Enable RLS for testimonials if not already enabled
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for testimonials
CREATE POLICY "Users can view their own testimonials" ON public.testimonials FOR SELECT TO authenticated USING (email = auth.jwt() ->> 'email' OR name = auth.jwt() ->> 'full_name');
CREATE POLICY "Users can insert their own testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (email = auth.jwt() ->> 'email');
