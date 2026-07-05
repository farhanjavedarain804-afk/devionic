
-- Create sequence for job numbers
CREATE SEQUENCE IF NOT EXISTS public.job_number_seq START 1;

-- Function to generate job code
CREATE OR REPLACE FUNCTION public.generate_job_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  next_num integer;
  current_year text;
BEGIN
  next_num := nextval('public.job_number_seq');
  current_year := to_char(now(), 'YYYY');
  NEW.id_code := 'DEV-' || current_year || '-JOB-' || lpad(next_num::text, 4, '0');
  RETURN NEW;
END;
$$;

-- Add id_code column to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS id_code text;

-- Trigger to auto-generate job code
CREATE TRIGGER set_job_code BEFORE INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.generate_job_code();

-- Backfill existing jobs
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn,
         to_char(created_at, 'YYYY') AS yr
  FROM public.jobs
)
UPDATE public.jobs SET id_code = 'DEV-' || n.yr || '-JOB-' || lpad(n.rn::text, 4, '0')
FROM numbered n WHERE jobs.id = n.id;
