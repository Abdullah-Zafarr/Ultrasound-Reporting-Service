CREATE TABLE IF NOT EXISTS public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  exam_type text NOT NULL,
  template_type text NOT NULL,
  tier_availability text NOT NULL DEFAULT 'basic',
  supports_logo boolean NOT NULL DEFAULT true,
  includes_sonulabs_branding boolean NOT NULL DEFAULT false,
  layout_style text,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.report_branding_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_name text,
  hospital_address text,
  hospital_phone text,
  hospital_email text,
  hospital_website text,
  logo_url text,
  footer_text text,
  show_sonulabs_branding boolean NOT NULL DEFAULT true,
  created_by uuid NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_branding_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read active report templates" ON public.report_templates;
CREATE POLICY "Authenticated read active report templates"
  ON public.report_templates FOR SELECT
  TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage report templates" ON public.report_templates;
CREATE POLICY "Admins manage report templates"
  ON public.report_templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated read branding settings" ON public.report_branding_settings;
CREATE POLICY "Authenticated read branding settings"
  ON public.report_branding_settings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins manage branding settings" ON public.report_branding_settings;
CREATE POLICY "Admins manage branding settings"
  ON public.report_branding_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS report_templates_exam_type_idx ON public.report_templates(exam_type);
CREATE INDEX IF NOT EXISTS report_templates_tier_idx ON public.report_templates(tier_availability);
CREATE INDEX IF NOT EXISTS report_templates_active_idx ON public.report_templates(is_active);
CREATE INDEX IF NOT EXISTS report_branding_settings_updated_idx ON public.report_branding_settings(updated_at);
