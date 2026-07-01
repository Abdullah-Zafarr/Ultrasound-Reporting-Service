CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE default_org_id uuid;
BEGIN
  SELECT id INTO default_org_id FROM public.organizations ORDER BY created_at ASC LIMIT 1;
  IF default_org_id IS NULL THEN
    INSERT INTO public.organizations(name, code) VALUES ('Default Organization', 'default-org')
    RETURNING id INTO default_org_id;
  END IF;

  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
  UPDATE public.profiles SET organization_id = default_org_id WHERE organization_id IS NULL;

  ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
  UPDATE public.patients SET organization_id = default_org_id WHERE organization_id IS NULL;

  ALTER TABLE public.studies ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
  UPDATE public.studies SET organization_id = default_org_id WHERE organization_id IS NULL;

  ALTER TABLE public.worksheets ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
  UPDATE public.worksheets SET organization_id = default_org_id WHERE organization_id IS NULL;

  ALTER TABLE public.hl7_messages ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
  UPDATE public.hl7_messages SET organization_id = default_org_id WHERE organization_id IS NULL;

  -- Add organization_id to report templates and branding settings
  ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
  UPDATE public.report_templates SET organization_id = default_org_id WHERE organization_id IS NULL;

  ALTER TABLE public.report_branding_settings ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
  UPDATE public.report_branding_settings SET organization_id = default_org_id WHERE organization_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS profiles_org_idx ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS patients_org_idx ON public.patients(organization_id);
CREATE INDEX IF NOT EXISTS studies_org_idx ON public.studies(organization_id);
CREATE INDEX IF NOT EXISTS worksheets_org_idx ON public.worksheets(organization_id);
CREATE INDEX IF NOT EXISTS hl7_messages_org_idx ON public.hl7_messages(organization_id);
CREATE INDEX IF NOT EXISTS report_templates_org_idx ON public.report_templates(organization_id);
CREATE INDEX IF NOT EXISTS report_branding_settings_org_idx ON public.report_branding_settings(organization_id);
