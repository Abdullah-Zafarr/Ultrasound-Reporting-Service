-- ============================================================
-- BULLETPROOF DATABASE INTEGRATION
-- 1. Updates RLS policies for Studies
-- 2. Enforces organization_id constraints
-- 3. Formalizes performance indexes
-- ============================================================

-- 1. Allow clinical staff to update study assignment (fixes "Send to Doctor" permissions)
DROP POLICY IF EXISTS "Admins can update studies" ON public.studies;
DROP POLICY IF EXISTS "Clinical staff can update studies" ON public.studies;

CREATE POLICY "Clinical staff can update studies"
  ON public.studies FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR (assigned_to IS NULL OR assigned_to = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'radiologist')
    OR (assigned_to IS NULL OR assigned_to = auth.uid())
  );

-- 2. Lock down tables to require organization_id (No more orphaned records)
ALTER TABLE public.patients ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.studies ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.worksheets ALTER COLUMN organization_id SET NOT NULL;

-- 3. Formalize performance indexes (Already manually created, but documented here)
CREATE INDEX IF NOT EXISTS idx_patients_org ON public.patients (organization_id);
CREATE INDEX IF NOT EXISTS idx_studies_org ON public.studies (organization_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_org ON public.worksheets (organization_id);

-- 4. Safety check: Ensure organizations table itself is readable by all authed users
-- (This ensures the frontend can always resolve org membership)
DROP POLICY IF EXISTS "Authenticated can read organizations" ON public.organizations;
CREATE POLICY "Authenticated can read organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (true);
