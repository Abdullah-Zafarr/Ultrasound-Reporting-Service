-- Run this in Supabase SQL Editor to force PostgREST to reload its schema cache.
-- This is needed after running ALTER TABLE migrations that add new columns,
-- so that queries using those new columns (organization_id, patient_id, etc.
-- on hl7_messages) stop returning PGRST204 "column not found in schema cache".

NOTIFY pgrst, 'reload schema';
