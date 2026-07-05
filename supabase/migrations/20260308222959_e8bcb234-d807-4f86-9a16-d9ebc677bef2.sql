
-- Drop old job code trigger and function with CASCADE
DROP FUNCTION IF EXISTS public.generate_job_code() CASCADE;

-- Drop old service code trigger and function with CASCADE
DROP FUNCTION IF EXISTS public.generate_service_code() CASCADE;

-- Update jobs id_code default to use standard format
ALTER TABLE public.jobs ALTER COLUMN id_code SET DEFAULT generate_display_id('JOB'::text);

-- Update services code default to use standard format
ALTER TABLE public.services ALTER COLUMN code SET DEFAULT generate_display_id('SRV'::text);
