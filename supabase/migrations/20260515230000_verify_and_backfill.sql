-- ============================================================
-- QUICK VERIFY & FIX — run in Supabase SQL Editor
-- ============================================================

-- 1. See ALL profiles and their user_roles status
SELECT
  p.id,
  p.email,
  p.role          AS profile_role,
  ur.role         AS user_roles_entry,
  CASE WHEN ur.role IS NULL THEN '⚠ MISSING from user_roles' ELSE '✓ OK' END AS status
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role::text = p.role
ORDER BY p.email;

-- 2. Backfill any missing user_roles entries
--    (safe to re-run — uses INSERT ... WHERE NOT EXISTS)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, p.role::public.app_role
FROM public.profiles p
WHERE p.role IN ('admin', 'doctor', 'sonographer', 'radiologist')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role::text = p.role
  );

-- 3. Verify has_role now returns true for your sonographer
--    Replace the UUID below with the sonographer's actual user ID from the results above
-- SELECT public.has_role('<paste-sonographer-user-id-here>', 'sonographer');

-- 4. Confirm studies table column names (should show study_date, NOT updated_at)
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'studies'
ORDER BY ordinal_position;
