
-- Add status tracking columns to service_inquiries
ALTER TABLE public.service_inquiries 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS resolved_notes text,
  ADD COLUMN IF NOT EXISTS resolved_attachments text[],
  ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;

-- Add status tracking columns to inquiries
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS resolved_notes text,
  ADD COLUMN IF NOT EXISTS resolved_attachments text[],
  ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;

-- Add resolution columns to complaints (already has status)
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS resolved_notes text,
  ADD COLUMN IF NOT EXISTS resolved_attachments text[],
  ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;
