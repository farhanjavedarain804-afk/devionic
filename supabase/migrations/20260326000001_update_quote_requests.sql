-- Add company_name and country to quote_requests
ALTER TABLE public.quote_requests 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS country text;
