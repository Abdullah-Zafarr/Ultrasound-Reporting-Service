-- ============================================================
-- Worksheet payload compatibility and backfill
-- Ensures doctor review can load sonographer worksheet payloads
-- whether the project database is on the legacy form_data schema
-- or the newer data/report_text schema.
-- ============================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sonographer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'radiologist';

ALTER TABLE public.worksheets
  ADD COLUMN IF NOT EXISTS patient_id uuid NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS user_id uuid NULL REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS created_by uuid NULL REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS worksheet_type text NOT NULL DEFAULT 'Abdomen',
  ADD COLUMN IF NOT EXISTS data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS report_text text,
  ADD COLUMN IF NOT EXISTS signed_by uuid NULL REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS signed_at timestamptz;

UPDATE public.worksheets w
SET
  patient_id = COALESCE(w.patient_id, s.patient_id),
  user_id = COALESCE(w.user_id, w.sonographer_id),
  created_by = COALESCE(w.created_by, w.sonographer_id),
  data = CASE
    WHEN w.data = '{}'::jsonb AND w.form_data IS NOT NULL THEN w.form_data
    ELSE w.data
  END
FROM public.studies s
WHERE s.id = w.study_id;

CREATE INDEX IF NOT EXISTS worksheets_patient_id_idx ON public.worksheets(patient_id);
CREATE INDEX IF NOT EXISTS worksheets_study_id_idx ON public.worksheets(study_id);
CREATE INDEX IF NOT EXISTS worksheets_user_id_idx ON public.worksheets(user_id);
CREATE INDEX IF NOT EXISTS worksheets_type_idx ON public.worksheets(worksheet_type);
