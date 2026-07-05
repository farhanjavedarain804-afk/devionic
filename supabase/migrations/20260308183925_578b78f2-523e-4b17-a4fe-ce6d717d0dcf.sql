
CREATE OR REPLACE FUNCTION public.auto_add_hired_to_staff()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'hired' AND (OLD.status IS DISTINCT FROM 'hired') THEN
    INSERT INTO public.staff (name, email, phone, position, department, staff_type, cnic, join_date)
    VALUES (
      NEW.full_name,
      NEW.email,
      COALESCE(NEW.phone1, NEW.whatsapp),
      NEW.job_title,
      'General',
      'permanent',
      NEW.cnic,
      CURRENT_DATE
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_application_hired
  AFTER UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_hired_to_staff();
