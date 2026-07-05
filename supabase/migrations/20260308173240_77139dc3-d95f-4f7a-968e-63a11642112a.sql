
CREATE OR REPLACE FUNCTION public.generate_service_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  max_num integer;
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    SELECT COALESCE(MAX(
      CASE WHEN code ~ '^SRV-[0-9]+$' THEN CAST(substr(code, 5) AS integer) ELSE 0 END
    ), 0) INTO max_num FROM public.services;
    NEW.code := 'SRV-' || lpad((max_num + 1)::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_service_code
  BEFORE INSERT ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_service_code();

ALTER TABLE public.services ALTER COLUMN code DROP DEFAULT;
