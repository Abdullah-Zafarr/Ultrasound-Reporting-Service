
-- Patients
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read patients" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (true);

-- Studies
CREATE TABLE public.studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  accession_number TEXT NOT NULL UNIQUE,
  modality TEXT NOT NULL DEFAULT 'US',
  study_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT
);
ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read studies" ON public.studies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert studies" ON public.studies FOR INSERT TO authenticated WITH CHECK (true);

-- Worksheets
CREATE TABLE public.worksheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES public.studies(id) ON DELETE CASCADE,
  sonographer_id UUID NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','signed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sonographers read own worksheets" ON public.worksheets FOR SELECT TO authenticated USING (auth.uid() = sonographer_id);
CREATE POLICY "Sonographers insert own worksheets" ON public.worksheets FOR INSERT TO authenticated WITH CHECK (auth.uid() = sonographer_id);
CREATE POLICY "Sonographers update own worksheets" ON public.worksheets FOR UPDATE TO authenticated USING (auth.uid() = sonographer_id);

-- HL7 messages
CREATE TABLE public.hl7_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worksheet_id UUID NOT NULL REFERENCES public.worksheets(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'ORU^R01',
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','transmitted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hl7_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read hl7" ON public.hl7_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.worksheets w WHERE w.id = worksheet_id AND w.sonographer_id = auth.uid())
);
CREATE POLICY "Authenticated insert hl7" ON public.hl7_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.worksheets w WHERE w.id = worksheet_id AND w.sonographer_id = auth.uid())
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_worksheets_updated_at
BEFORE UPDATE ON public.worksheets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
