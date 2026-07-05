
-- Add display_id columns to tables that don't have one

-- Testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS display_id text NOT NULL DEFAULT ('TST-' || upper(substr(gen_random_uuid()::text, 1, 8)));

-- Service Inquiries
ALTER TABLE public.service_inquiries ADD COLUMN IF NOT EXISTS display_id text NOT NULL DEFAULT ('SRI-' || upper(substr(gen_random_uuid()::text, 1, 8)));

-- General Inquiries  
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS display_id text NOT NULL DEFAULT ('INQ-' || upper(substr(gen_random_uuid()::text, 1, 8)));

-- Quote Requests
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS display_id text NOT NULL DEFAULT ('QRQ-' || upper(substr(gen_random_uuid()::text, 1, 8)));

-- Customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS display_id text NOT NULL DEFAULT ('CUS-' || upper(substr(gen_random_uuid()::text, 1, 8)));

-- Staff
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS display_id text NOT NULL DEFAULT ('STF-' || upper(substr(gen_random_uuid()::text, 1, 8)));

-- Attendance
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS display_id text NOT NULL DEFAULT ('ATT-' || upper(substr(gen_random_uuid()::text, 1, 8)));

-- Financials
ALTER TABLE public.financials ADD COLUMN IF NOT EXISTS display_id text NOT NULL DEFAULT ('FIN-' || upper(substr(gen_random_uuid()::text, 1, 8)));
