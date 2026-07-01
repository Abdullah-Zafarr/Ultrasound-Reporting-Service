ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS medicare_number text,
  ADD COLUMN IF NOT EXISTS gender text;

ALTER TABLE public.studies
  ADD COLUMN IF NOT EXISTS referring_physician text,
  ADD COLUMN IF NOT EXISTS provider_number text,
  ADD COLUMN IF NOT EXISTS clinical_indication text;