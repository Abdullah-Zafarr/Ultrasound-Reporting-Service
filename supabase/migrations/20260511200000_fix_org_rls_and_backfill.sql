-- ============================================================
-- PERMANENT FIX: Organization RLS policy + data backfill
-- Root cause: organizations table had no RLS SELECT policy,
-- so all client-side fallback queries returned null silently.
-- ============================================================

-- 1. Allow any authenticated user to read organizations
--    (required so the browser client can resolve org membership)
DROP POLICY IF EXISTS "Authenticated can read organizations" ON public.organizations;
CREATE POLICY "Authenticated can read organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (true);

-- 2. Ensure the default organization exists
INSERT INTO public.organizations (name, code, is_active)
VALUES ('Default Organization', 'default-org', true)
ON CONFLICT (code) DO NOTHING;

-- 3. Backfill: Link any profiles with NULL organization_id to the default org
UPDATE public.profiles
SET organization_id = (
  SELECT id FROM public.organizations WHERE code = 'default-org' LIMIT 1
)
WHERE organization_id IS NULL;

-- 4. Backfill: Link any patients with NULL organization_id
UPDATE public.patients
SET organization_id = (
  SELECT id FROM public.organizations WHERE code = 'default-org' LIMIT 1
)
WHERE organization_id IS NULL;

-- 5. Backfill: Link any studies with NULL organization_id
UPDATE public.studies
SET organization_id = (
  SELECT id FROM public.organizations WHERE code = 'default-org' LIMIT 1
)
WHERE organization_id IS NULL;

-- 6. Backfill: Link any worksheets with NULL organization_id
UPDATE public.worksheets
SET organization_id = (
  SELECT id FROM public.organizations WHERE code = 'default-org' LIMIT 1
)
WHERE organization_id IS NULL;
