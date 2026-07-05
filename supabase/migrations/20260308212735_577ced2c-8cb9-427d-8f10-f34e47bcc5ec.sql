
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS closing_date date;
