-- Legacy compatibility bridge.
-- The modern JSON-backed report_templates schema is created in
-- 20260509110000_report_templates_and_branding.sql, and built-in templates now
-- ship from application code rather than being seeded into the database here.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'report_templates'
      AND column_name = 'exam_type'
  ) THEN
    RAISE NOTICE 'Modern report_templates schema detected; skipping legacy seed migration.';
  ELSE
    RAISE NOTICE 'report_templates schema not present yet; legacy migration intentionally left as a no-op.';
  END IF;
END $$;
