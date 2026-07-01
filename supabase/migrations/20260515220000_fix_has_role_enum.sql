-- ============================================================
-- ROOT CAUSE FIX: has_role() only checks user_roles table,
-- but the app_role ENUM only had 'admin' and 'doctor'.
-- Sonographers and radiologists were invisible to every RLS policy.
--
-- This migration:
-- 1. Adds 'sonographer' and 'radiologist' to the app_role enum
-- 2. Rewrites has_role() to also check profiles.role (text column)
--    so it works regardless of which table holds the role
-- 3. Backfills user_roles from profiles so existing users
--    pass has_role() checks immediately
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Extend the app_role enum
-- ----------------------------------------------------------------
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sonographer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'radiologist';

-- ----------------------------------------------------------------
-- 2. Rewrite has_role() to check BOTH user_roles AND profiles.role
--    This ensures it works whether the role was assigned via the
--    admin panel (user_roles) or set directly on profiles.role
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role::text
  )
$$;

-- ----------------------------------------------------------------
-- 3. Backfill user_roles from profiles for ALL existing users
--    so the user_roles path also works going forward
-- ----------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT
  p.id,
  p.role::public.app_role
FROM public.profiles p
WHERE
  p.role IN ('admin', 'doctor', 'sonographer', 'radiologist')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role = p.role::public.app_role
  );

-- ----------------------------------------------------------------
-- 4. Re-confirm RLS policies are in place (idempotent)
--    The critical one: sonographers can UPDATE studies
-- ----------------------------------------------------------------
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
-- 5. VERIFY — run after the above to confirm the fix
-- ----------------------------------------------------------------

-- 5a. Confirm enum values now include sonographer/radiologist
SELECT enumlabel FROM pg_enum
WHERE enumtypid = 'public.app_role'::regtype
ORDER BY enumsortorder;
-- Expected: admin, doctor, sonographer, radiologist

-- 5b. Confirm user_roles now has rows for all clinical users
SELECT p.email, p.role, ur.role AS user_roles_entry
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = p.role::public.app_role
ORDER BY p.email;
-- Expected: every row has a matching user_roles_entry

-- 5c. Confirm has_role works for a sonographer (replace with actual user id)
-- SELECT public.has_role('<sonographer-user-id>', 'sonographer');
-- Expected: true
