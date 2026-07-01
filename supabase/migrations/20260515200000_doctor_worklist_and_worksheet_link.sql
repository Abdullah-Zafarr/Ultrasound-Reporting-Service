-- ============================================================
-- Doctor Worklist & Worksheet Sync Fix
-- 1. Add studies.active_worksheet_id so doctor always loads
--    exactly the worksheet the sonographer submitted.
-- 2. Fix RLS: sonographers can update studies (to assign doctor).
-- 3. Fix RLS: doctors can read worksheets for assigned studies.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Canonical worksheet pointer on studies
-- ----------------------------------------------------------------
ALTER TABLE public.studies
  ADD COLUMN IF NOT EXISTS active_worksheet_id uuid
    NULL REFERENCES public.worksheets(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS studies_active_worksheet_idx
  ON public.studies(active_worksheet_id);

-- ----------------------------------------------------------------
-- 2. Sonographers must be able to UPDATE studies to assign a doctor
--    and flip the status to review_pending.
--    The prior "Clinical staff can update studies" policy
--    in 20260514000000_bulletproof_db.sql only allowed
--    assigned_to IS NULL OR assigned_to = auth.uid(), which blocks
--    sonographers from assigning a study that was previously assigned.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Clinical staff can update studies" ON public.studies;
DROP POLICY IF EXISTS "Sonographers can assign studies"   ON public.studies;
DROP POLICY IF EXISTS "Admins can update studies"         ON public.studies;

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

-- ----------------------------------------------------------------
-- 3. Doctors/radiologists must be able to SELECT studies assigned
--    to them (some older RLS policies only allowed assigned_to IS NULL
--    which stops working once a study gets assigned).
-- ----------------------------------------------------------------
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

-- ----------------------------------------------------------------
-- 4. Doctors/radiologists must be able to SELECT worksheets for
--    studies assigned to them (the prior policy checked
--    assigned_to IS NULL which is false once assigned).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Clinical staff can read allowed worksheets" ON public.worksheets;
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
        AND (
          s.assigned_to = auth.uid()
          OR s.assigned_to IS NULL
        )
    )
  );

-- ----------------------------------------------------------------
-- 5. Doctors/radiologists must be able to UPDATE worksheets they are
--    reviewing (sign/transmit actions).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Draft owners can update worksheets" ON public.worksheets;

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

-- ----------------------------------------------------------------
-- 6. Backfill active_worksheet_id for existing studies that already
--    have worksheets (pick the most recently updated draft/signed one)
-- ----------------------------------------------------------------
UPDATE public.studies s
SET active_worksheet_id = (
  SELECT w.id
  FROM public.worksheets w
  WHERE w.study_id = s.id
    AND w.status IN ('draft', 'signed', 'transmitted', 'failed')
  ORDER BY w.updated_at DESC
  LIMIT 1
)
WHERE s.active_worksheet_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.worksheets w2
    WHERE w2.study_id = s.id
  );
