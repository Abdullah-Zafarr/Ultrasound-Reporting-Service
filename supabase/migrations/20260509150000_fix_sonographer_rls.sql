-- Ensure roles exist before using them in policies
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sonographer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'radiologist';

DROP POLICY IF EXISTS "Clinical staff can read allowed patients" ON public.patients;

CREATE POLICY "Clinical staff can read allowed patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR public.has_role(auth.uid(), 'sonographer') -- Added this
    OR EXISTS (
      SELECT 1 FROM public.studies s
      WHERE s.patient_id = patients.id
        AND (s.assigned_to = auth.uid() OR s.assigned_to IS NULL)
    )
  );

-- Also ensure sonographers can read all studies for now to avoid similar issues
DROP POLICY IF EXISTS "Clinical staff can read allowed studies" ON public.studies;

CREATE POLICY "Clinical staff can read allowed studies"
  ON public.studies FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR public.has_role(auth.uid(), 'sonographer') -- Added this
    OR assigned_to = auth.uid()
    OR assigned_to IS NULL
  );
