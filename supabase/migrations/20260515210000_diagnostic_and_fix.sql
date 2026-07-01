-- ============================================================
-- TARGETED SCHEMA FIX
-- Based on actual live DB schema — run this in Supabase SQL Editor.
-- This is idempotent (safe to run multiple times).
-- ============================================================


-- ============================================================
-- 1. FIX worksheets TABLE
-- ============================================================

-- 1a. Add patient_id column (code writes it, DB needs it)
ALTER TABLE public.worksheets
  ADD COLUMN IF NOT EXISTS patient_id uuid NULL REFERENCES public.patients(id) ON DELETE CASCADE;

-- 1b. Add data column (code reads worksheet payload from here; fallback is form_data)
ALTER TABLE public.worksheets
  ADD COLUMN IF NOT EXISTS data jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 1c. Backfill data from form_data so existing rows are readable
UPDATE public.worksheets
SET data = form_data
WHERE data = '{}'::jsonb AND form_data IS NOT NULL AND form_data != '{}'::jsonb;

-- 1d. Backfill patient_id from the linked study
UPDATE public.worksheets w
SET patient_id = s.patient_id
FROM public.studies s
WHERE s.id = w.study_id AND w.patient_id IS NULL;

-- 1e. WIDEN the status CHECK constraint — current DB only allows 'draft'/'signed'
--     but code also uses 'transmitted' and 'failed'
ALTER TABLE public.worksheets DROP CONSTRAINT IF EXISTS worksheets_status_check;
ALTER TABLE public.worksheets
  ADD CONSTRAINT worksheets_status_check
  CHECK (status IN ('draft', 'signed', 'transmitted', 'failed'));

-- ============================================================
-- 2. FIX studies TABLE
-- ============================================================

-- 2a. Add active_worksheet_id so doctor always loads the exact worksheet
--     the sonographer submitted
ALTER TABLE public.studies
  ADD COLUMN IF NOT EXISTS active_worksheet_id uuid
    NULL REFERENCES public.worksheets(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS studies_active_worksheet_idx
  ON public.studies(active_worksheet_id);

-- 2b. Backfill active_worksheet_id for already-assigned studies
UPDATE public.studies s
SET active_worksheet_id = (
  SELECT w.id
  FROM public.worksheets w
  WHERE w.study_id = s.id
  ORDER BY w.updated_at DESC
  LIMIT 1
)
WHERE s.active_worksheet_id IS NULL
  AND EXISTS (SELECT 1 FROM public.worksheets w WHERE w.study_id = s.id);


-- ============================================================
-- 3. FIX hl7_messages TABLE
-- ============================================================

ALTER TABLE public.hl7_messages
  ADD COLUMN IF NOT EXISTS patient_id  uuid NULL REFERENCES public.patients(id)  ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS endpoint_url text,
  ADD COLUMN IF NOT EXISTS response_body text,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS sent_by     uuid NULL REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS sent_at     timestamp with time zone;

-- Widen the status CHECK — current DB only allows 'pending'/'transmitted'
-- but code also uses 'sent' and 'failed'
ALTER TABLE public.hl7_messages DROP CONSTRAINT IF EXISTS hl7_messages_status_check;
ALTER TABLE public.hl7_messages
  ADD CONSTRAINT hl7_messages_status_check
  CHECK (status IN ('pending', 'sent', 'transmitted', 'failed'));

-- Backfill patient_id from worksheet link
UPDATE public.hl7_messages h
SET patient_id = w.patient_id
FROM public.worksheets w
WHERE h.worksheet_id = w.id AND h.patient_id IS NULL;


-- ============================================================
-- 4. FIX RLS POLICIES
-- ============================================================

-- 4a. Sonographers must be able to UPDATE studies (assign to doctor).
--     Old policy blocked them unless assigned_to was NULL.
DROP POLICY IF EXISTS "Clinical staff can update studies" ON public.studies;
DROP POLICY IF EXISTS "Admins can update studies"         ON public.studies;
DROP POLICY IF EXISTS "Sonographers can assign studies"   ON public.studies;

CREATE POLICY "Clinical staff can update studies"
  ON public.studies FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR public.has_role(auth.uid(), 'sonographer')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR public.has_role(auth.uid(), 'sonographer')
  );

-- 4b. Doctors can SELECT studies assigned to them
DROP POLICY IF EXISTS "Clinical staff can read allowed studies" ON public.studies;

CREATE POLICY "Clinical staff can read allowed studies"
  ON public.studies FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR assigned_to = auth.uid()
    OR assigned_to IS NULL
  );

-- 4c. Doctors can SELECT worksheets for studies assigned to them
DROP POLICY IF EXISTS "Clinical staff can read allowed worksheets" ON public.worksheets;
DROP POLICY IF EXISTS "Sonographers read own worksheets"           ON public.worksheets;
DROP POLICY IF EXISTS "Admins read all worksheets"                 ON public.worksheets;
DROP POLICY IF EXISTS "Doctors read assigned worksheets"           ON public.worksheets;

CREATE POLICY "Clinical staff can read allowed worksheets"
  ON public.worksheets FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR user_id = auth.uid()
    OR sonographer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.studies s
      WHERE s.id = worksheets.study_id
        AND (s.assigned_to = auth.uid() OR s.assigned_to IS NULL)
    )
  );

-- 4d. Doctors can INSERT/UPDATE worksheets (to sign/transmit)
DROP POLICY IF EXISTS "Sonographers insert own worksheets"  ON public.worksheets;
DROP POLICY IF EXISTS "Sonographers update own worksheets"  ON public.worksheets;
DROP POLICY IF EXISTS "Clinical staff can create worksheets" ON public.worksheets;
DROP POLICY IF EXISTS "Draft owners can update worksheets"  ON public.worksheets;

CREATE POLICY "Clinical staff can create worksheets"
  ON public.worksheets FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR user_id = auth.uid()
    OR sonographer_id = auth.uid()
  );

CREATE POLICY "Draft owners can update worksheets"
  ON public.worksheets FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR (status IN ('draft', 'failed') AND (user_id = auth.uid() OR sonographer_id = auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.studies s
      WHERE s.id = worksheets.study_id
        AND s.assigned_to = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR (status IN ('draft', 'failed') AND (user_id = auth.uid() OR sonographer_id = auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.studies s
      WHERE s.id = worksheets.study_id
        AND s.assigned_to = auth.uid()
    )
  );

-- 4e. HL7 messages — doctors and sonographers can insert
DROP POLICY IF EXISTS "Authenticated read hl7"           ON public.hl7_messages;
DROP POLICY IF EXISTS "Authenticated insert hl7"          ON public.hl7_messages;
DROP POLICY IF EXISTS "Admins read all hl7"              ON public.hl7_messages;
DROP POLICY IF EXISTS "Clinical staff can read hl7 messages"    ON public.hl7_messages;
DROP POLICY IF EXISTS "Doctors admins can create hl7 messages"  ON public.hl7_messages;
DROP POLICY IF EXISTS "Doctors admins can update hl7 messages"  ON public.hl7_messages;

CREATE POLICY "Clinical staff can read hl7 messages"
  ON public.hl7_messages FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR sent_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.worksheets w
      WHERE w.id = hl7_messages.worksheet_id
        AND (w.user_id = auth.uid() OR w.sonographer_id = auth.uid())
    )
  );

CREATE POLICY "Clinical staff can create hl7 messages"
  ON public.hl7_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR public.has_role(auth.uid(), 'sonographer')
  );

CREATE POLICY "Clinical staff can update hl7 messages"
  ON public.hl7_messages FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
  );


-- ============================================================
-- 5. VERIFY — run this last to check everything is in order
-- ============================================================

-- Columns in worksheets
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'worksheets'
ORDER BY ordinal_position;

-- Columns in studies
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'studies'
ORDER BY ordinal_position;

-- Active RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('studies','worksheets','hl7_messages')
ORDER BY tablename, policyname;

-- Assigned studies with worksheet link
SELECT
  s.id           AS study_id,
  s.status,
  s.assigned_to,
  s.active_worksheet_id,
  pr.email       AS assigned_to_email,
  pr.role        AS assigned_to_role
FROM public.studies s
LEFT JOIN public.profiles pr ON pr.id = s.assigned_to
WHERE s.assigned_to IS NOT NULL
ORDER BY s.study_date DESC
LIMIT 20;
