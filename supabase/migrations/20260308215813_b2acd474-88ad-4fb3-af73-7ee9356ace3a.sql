
-- Create sequences for each prefix
CREATE SEQUENCE IF NOT EXISTS seq_tst START 1;
CREATE SEQUENCE IF NOT EXISTS seq_sri START 1;
CREATE SEQUENCE IF NOT EXISTS seq_inq START 1;
CREATE SEQUENCE IF NOT EXISTS seq_qrq START 1;
CREATE SEQUENCE IF NOT EXISTS seq_cus START 1;
CREATE SEQUENCE IF NOT EXISTS seq_stf START 1;
CREATE SEQUENCE IF NOT EXISTS seq_att START 1;
CREATE SEQUENCE IF NOT EXISTS seq_fin START 1;
CREATE SEQUENCE IF NOT EXISTS seq_inv START 1;
CREATE SEQUENCE IF NOT EXISTS seq_quo START 1;
CREATE SEQUENCE IF NOT EXISTS seq_job START 1;
CREATE SEQUENCE IF NOT EXISTS seq_app START 1;
CREATE SEQUENCE IF NOT EXISTS seq_cmp START 1;
CREATE SEQUENCE IF NOT EXISTS seq_sal START 1;
CREATE SEQUENCE IF NOT EXISTS seq_srv START 1;

-- Function to generate display ID in format: PREFIX-DDMMYYYY-DEV-0001
CREATE OR REPLACE FUNCTION generate_display_id(prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  seq_name text;
  next_val bigint;
  date_part text;
BEGIN
  seq_name := 'seq_' || lower(prefix);
  EXECUTE format('SELECT nextval(%L)', seq_name) INTO next_val;
  date_part := to_char(now(), 'DDMMYYYY');
  RETURN prefix || '-' || date_part || '-DEV-' || lpad(next_val::text, 4, '0');
END;
$$;

-- Update existing row counts to set sequences correctly
DO $$
DECLARE
  cnt bigint;
BEGIN
  SELECT count(*) INTO cnt FROM public.testimonials; IF cnt > 0 THEN PERFORM setval('seq_tst', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.service_inquiries; IF cnt > 0 THEN PERFORM setval('seq_sri', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.inquiries; IF cnt > 0 THEN PERFORM setval('seq_inq', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.quote_requests; IF cnt > 0 THEN PERFORM setval('seq_qrq', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.customers; IF cnt > 0 THEN PERFORM setval('seq_cus', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.staff; IF cnt > 0 THEN PERFORM setval('seq_stf', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.attendance; IF cnt > 0 THEN PERFORM setval('seq_att', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.financials; IF cnt > 0 THEN PERFORM setval('seq_fin', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.invoices; IF cnt > 0 THEN PERFORM setval('seq_inv', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.quotations; IF cnt > 0 THEN PERFORM setval('seq_quo', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.jobs; IF cnt > 0 THEN PERFORM setval('seq_job', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.job_applications; IF cnt > 0 THEN PERFORM setval('seq_app', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.complaints; IF cnt > 0 THEN PERFORM setval('seq_cmp', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.salary_slips; IF cnt > 0 THEN PERFORM setval('seq_sal', cnt); END IF;
  SELECT count(*) INTO cnt FROM public.services; IF cnt > 0 THEN PERFORM setval('seq_srv', cnt); END IF;
END;
$$;

-- Update defaults for display_id columns
ALTER TABLE public.testimonials ALTER COLUMN display_id SET DEFAULT generate_display_id('TST');
ALTER TABLE public.service_inquiries ALTER COLUMN display_id SET DEFAULT generate_display_id('SRI');
ALTER TABLE public.inquiries ALTER COLUMN display_id SET DEFAULT generate_display_id('INQ');
ALTER TABLE public.quote_requests ALTER COLUMN display_id SET DEFAULT generate_display_id('QRQ');
ALTER TABLE public.customers ALTER COLUMN display_id SET DEFAULT generate_display_id('CUS');
ALTER TABLE public.staff ALTER COLUMN display_id SET DEFAULT generate_display_id('STF');
ALTER TABLE public.attendance ALTER COLUMN display_id SET DEFAULT generate_display_id('ATT');
ALTER TABLE public.financials ALTER COLUMN display_id SET DEFAULT generate_display_id('FIN');

-- Update defaults for other ID columns
ALTER TABLE public.invoices ALTER COLUMN invoice_number SET DEFAULT generate_display_id('INV');
ALTER TABLE public.quotations ALTER COLUMN quotation_number SET DEFAULT generate_display_id('QUO');
ALTER TABLE public.complaints ALTER COLUMN tracking_id SET DEFAULT generate_display_id('CMP');
ALTER TABLE public.salary_slips ALTER COLUMN verification_id SET DEFAULT generate_display_id('SAL');
ALTER TABLE public.job_applications ALTER COLUMN application_number SET DEFAULT generate_display_id('APP');

-- Add display_id to jobs if using id_code
ALTER TABLE public.jobs ALTER COLUMN id_code SET DEFAULT generate_display_id('JOB');

-- Add code default for services
ALTER TABLE public.services ALTER COLUMN code SET DEFAULT generate_display_id('SRV');
