ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sonographer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'radiologist';

ALTER TABLE public.studies
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS assigned_to uuid NULL REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS exam_type text;

UPDATE public.studies
SET exam_type = COALESCE(exam_type, description, 'Ultrasound')
WHERE exam_type IS NULL;

CREATE INDEX IF NOT EXISTS studies_patient_id_idx ON public.studies(patient_id);
CREATE INDEX IF NOT EXISTS studies_assigned_to_idx ON public.studies(assigned_to);
CREATE INDEX IF NOT EXISTS studies_status_idx ON public.studies(status);
CREATE INDEX IF NOT EXISTS studies_accession_number_idx ON public.studies(accession_number);

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
    WHEN w.data = '{}'::jsonb THEN w.form_data
    ELSE w.data
  END
FROM public.studies s
WHERE w.study_id = s.id;

ALTER TABLE public.worksheets
  ALTER COLUMN patient_id SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.worksheets DROP CONSTRAINT IF EXISTS worksheets_status_check;
ALTER TABLE public.worksheets
  ADD CONSTRAINT worksheets_status_check
  CHECK (status IN ('draft', 'signed', 'transmitted', 'failed'));

CREATE INDEX IF NOT EXISTS worksheets_patient_id_idx ON public.worksheets(patient_id);
CREATE INDEX IF NOT EXISTS worksheets_study_id_idx ON public.worksheets(study_id);
CREATE INDEX IF NOT EXISTS worksheets_user_id_idx ON public.worksheets(user_id);
CREATE INDEX IF NOT EXISTS worksheets_status_idx ON public.worksheets(status);
CREATE INDEX IF NOT EXISTS worksheets_type_idx ON public.worksheets(worksheet_type);

ALTER TABLE public.hl7_messages
  ADD COLUMN IF NOT EXISTS patient_id uuid NULL REFERENCES public.patients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS study_id uuid NULL REFERENCES public.studies(id) ON DELETE SET NULL,
  ALTER COLUMN worksheet_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS endpoint_url text,
  ADD COLUMN IF NOT EXISTS response_body text,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS sent_by uuid NULL REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS sent_at timestamptz;

UPDATE public.hl7_messages h
SET
  patient_id = COALESCE(h.patient_id, w.patient_id),
  study_id = COALESCE(h.study_id, w.study_id)
FROM public.worksheets w
WHERE h.worksheet_id = w.id;

ALTER TABLE public.hl7_messages DROP CONSTRAINT IF EXISTS hl7_messages_status_check;
ALTER TABLE public.hl7_messages
  ADD CONSTRAINT hl7_messages_status_check
  CHECK (status IN ('pending', 'sent', 'failed', 'transmitted'));

CREATE INDEX IF NOT EXISTS hl7_messages_patient_id_idx ON public.hl7_messages(patient_id);
CREATE INDEX IF NOT EXISTS hl7_messages_study_id_idx ON public.hl7_messages(study_id);
CREATE INDEX IF NOT EXISTS hl7_messages_worksheet_id_idx ON public.hl7_messages(worksheet_id);
CREATE INDEX IF NOT EXISTS hl7_messages_status_idx ON public.hl7_messages(status);
CREATE INDEX IF NOT EXISTS hl7_messages_created_at_idx ON public.hl7_messages(created_at);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES auth.users(id),
  patient_id uuid NULL REFERENCES public.patients(id) ON DELETE SET NULL,
  study_id uuid NULL REFERENCES public.studies(id) ON DELETE SET NULL,
  worksheet_id uuid NULL REFERENCES public.worksheets(id) ON DELETE SET NULL,
  hl7_message_id uuid NULL REFERENCES public.hl7_messages(id) ON DELETE SET NULL,
  action text NOT NULL,
  status text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_study_id_idx ON public.audit_logs(study_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at);

DROP POLICY IF EXISTS "Authenticated can read patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated can read studies" ON public.studies;
DROP POLICY IF EXISTS "Authenticated can insert studies" ON public.studies;
DROP POLICY IF EXISTS "Sonographers read own worksheets" ON public.worksheets;
DROP POLICY IF EXISTS "Sonographers insert own worksheets" ON public.worksheets;
DROP POLICY IF EXISTS "Sonographers update own worksheets" ON public.worksheets;
DROP POLICY IF EXISTS "Admins read all worksheets" ON public.worksheets;
DROP POLICY IF EXISTS "Authenticated read hl7" ON public.hl7_messages;
DROP POLICY IF EXISTS "Authenticated insert hl7" ON public.hl7_messages;
DROP POLICY IF EXISTS "Admins read all hl7" ON public.hl7_messages;

CREATE POLICY "Clinical staff can read allowed patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR EXISTS (
      SELECT 1 FROM public.studies s
      WHERE s.patient_id = patients.id
        AND (s.assigned_to = auth.uid() OR s.assigned_to IS NULL)
    )
  );

CREATE POLICY "Clinical staff can create patients"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR public.has_role(auth.uid(), 'sonographer')
  );

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

CREATE POLICY "Clinical staff can create studies"
  ON public.studies FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR public.has_role(auth.uid(), 'sonographer')
  );

CREATE POLICY "Admins can update studies"
  ON public.studies FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

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
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR (status IN ('draft', 'failed') AND (user_id = auth.uid() OR sonographer_id = auth.uid()))
  );

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

CREATE POLICY "Doctors admins can create hl7 messages"
  ON public.hl7_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
  );

CREATE POLICY "Doctors admins can update hl7 messages"
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

CREATE POLICY "Clinical staff can create audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own audit logs admins read all"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
