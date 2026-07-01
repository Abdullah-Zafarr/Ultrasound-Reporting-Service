# Changelog (Admin Step 1)
Date: 2026-05-09

This file documents every file changed in this admin enhancement step.

## Line count method
- Added/Removed counts are from file diff (`git diff --no-index --numstat`) against baseline copy in `C:\Users\USER\Downloads\Ultrasound-Worksheet-Workflow-main`.
- Updated lines are estimated as `min(added, removed)` for modified files.

## 1) `app/admin/page.tsx`
- Added lines: 515
- Removed lines: 235
- Updated lines (estimated): 235
- Why changed:
  - Added Staff Management enhancements with role filter (`all/admin/doctor/radiologist/sonographer`).
  - Expanded staff table with account status, created date, and last activity with safe `Not available` fallbacks.
  - Added System Configuration panel with read-only health cards.
  - Added HL7 Operations panel for recent messages, status badge mapping, destination visibility, sent/created timestamp, and basic errors.
  - Added Audit/Activity panel with graceful placeholder if `audit_logs` is unavailable.
  - Added Clinical Workflow Metrics cards: total patients, total studies, draft worksheets, signed reports, transmitted reports, failed HL7.
  - Kept existing create/delete account flows and admin-only UX behavior.

## 2) `app/api/admin/system-health/route.ts` (new)
- Added lines: 41
- Removed lines: 0
- Updated lines: 0
- Why changed:
  - Added secure admin-only API route for system configuration health.
  - Server-side admin role validation before returning data.
  - Returns booleans only (`configured`/`missing`) for Supabase, service-role presence, DICOMweb, HL7 export, report API, and Gladia key.
  - Does not expose secret values or environment contents.

## Notes
- Existing clinical workflow logic (worksheets/report generation/HL7 send flow/DICOM routes/auth) was not changed in this step.
- Existing lint warning in `src/components/sonolynx/Logo.tsx` remains unchanged.

## STEP 2 - Report Template Foundation (2026-05-09)

Line counts below are current diff vs baseline copy in `C:\Users\USER\Downloads\Ultrasound-Worksheet-Workflow-main`.

### `src/lib/report-template-types.ts` (new)
- Added: 38
- Removed: 0
- Updated: 0
- Why:
  - Added template and section data model (`ReportTemplate`, `ReportTemplateSection`).
  - Added typed exam/template categories and safe placeholder token list.

### `src/lib/default-report-templates.ts` (new)
- Added: 207
- Removed: 0
- Updated: 0
- Why:
  - Added premade templates that work without DB persistence:
    - Standard Ultrasound Report
    - Abdomen Complete Report
    - Thyroid Nodule Report
    - OB Basic Report
    - Vascular Doppler Report

### `src/lib/report-template-engine.ts` (new)
- Added: 87
- Removed: 0
- Updated: 0
- Why:
  - Added safe renderer for placeholders and ordered/enabled sections.
  - Added strict fallback to existing `reportToText()` output if template is missing/invalid/errors.
  - No eval or unsafe execution.

### `src/lib/report-template-service.ts` (new)
- Added: 120
- Removed: 0
- Updated: 0
- Why:
  - Added template service functions:
    - `getActiveTemplates()`
    - `getTemplatesByExamType()`
    - `createTemplate()`
    - `updateTemplate()`
    - `deactivateTemplate()`
  - Supports code-first defaults + local custom template persistence.
  - Includes safe DB read attempt from `report_templates` with graceful fallback to local templates when table is unavailable.

### `src/components/sonolynx/admin/ReportTemplateManager.tsx` (new)
- Added: 371
- Removed: 0
- Updated: 0
- Why:
  - Added admin template management UI:
    - View premade and custom templates
    - Create custom templates from scratch
    - Edit name/description/exam type
    - Add/remove/reorder/enable/disable sections
    - Insert placeholders from token list
    - Preview rendered sample output
  - Premade templates are visible but not editable.

### `app/admin/page.tsx`
- Added: 431
- Removed: 239
- Updated (estimated): 239
- Why:
  - Integrated new `Report Templates` tab into admin dashboard.
  - Embedded `ReportTemplateManager` without changing existing user management/system/HL7 sections.

### `app/page.tsx`
- Added: 55
- Removed: 0
- Updated (estimated): 0
- Why:
  - Integrated template loading by exam type.
  - Added optional template selection state for report preview.
  - Added template rendering with safe fallback path.
  - Existing signing/HL7/report pipelines remain unchanged unless a template is selected for display.

### `src/components/sonoflow/ReportPreview.tsx`
- Added: 56
- Removed: 1
- Updated (estimated): 1
- Why:
  - Added optional template selector UI.
  - Added template output preview block.
  - Added explicit badge when fallback output is used.
  - Default legacy findings/impression preview remains present.

### Validation after Step 2
- `npm exec tsc -- --noEmit`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS with existing single warning in `src/components/sonolynx/Logo.tsx` only

## STEP 2 Adjustment - Template Flow Moved to Generate Report (2026-05-09)

### `app/page.tsx`
- Added: 67
- Removed: 1
- Updated (estimated): 1
- Why:
  - Kept template state loading, but removed template rendering from Findings preview flow.
  - Passed template selection/render result into structured report dialog (Generate Report flow).
  - Added company logo retrieval from local storage for report rendering.

### `src/components/sonoflow/ReportPreview.tsx`
- Added: 7
- Removed: 1
- Updated (estimated): 1
- Why:
  - Removed template-selection/template-output behavior from findings preview to restore original preview intent.
  - Findings/Impression preview remains standard and unchanged in behavior.

### `src/components/sonoflow/StructuredReportDialog.tsx`
- Added: 78
- Removed: 6
- Updated (estimated): 6
- Why:
  - Added template selector to Generate Report dialog.
  - Added styled A4-like formatted containers based on template layout style.
  - Added optional transparent logo/watermark rendering for applicable templates.
  - Raw and formatted report views now use template-rendered text when selected.

### `src/components/sonolynx/admin/ReportTemplateManager.tsx` (new)
- Added: 437
- Removed: 0
- Updated: 0
- Why:
  - Added template manager for viewing premade templates and building custom templates.
  - Added create-from-scratch section editor (add/remove/reorder/enable/disable).
  - Added placeholder insert buttons.
  - Added sample preview renderer.
  - Added company logo upload/remove controls stored locally and reused in report rendering.

### `src/lib/report-template-types.ts` (new)
- Added: 47
- Removed: 0
- Updated: 0
- Why:
  - Extended template model with `layoutStyle` for multiple report format variants.

### `src/lib/default-report-templates.ts` (new)
- Added: 296
- Removed: 0
- Updated: 0
- Why:
  - Expanded premade set to 7 templates and mapped each to distinct layout styles.
  - Set Standard Ultrasound template to watermark style (transparent logo capable).

### `src/lib/report-template-service.ts` (new)
- Added: 137
- Removed: 0
- Updated: 0
- Why:
  - Added company logo persistence helpers:
    - `getCompanyLogoDataUrl()`
    - `setCompanyLogoDataUrl()`
  - Retained safe template retrieval + local custom storage fallback model.

### Validation after adjustment
- `npm exec tsc -- --noEmit`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS with existing single warning in `src/components/sonolynx/Logo.tsx` only

## 2026-05-09 - STEP 2 (Revised): Professional Report Template System Foundation

### Summary
Implemented a report template foundation that wraps around existing report-engine output. Existing clinical logic remains the source of findings/impression text. The system adds A4-style templated rendering, admin branding settings, tier-ready template filtering, and print/download support.

### Files Created
- `src/lib/template-tier-access.ts`
- `src/lib/branding-service.ts`
- `src/lib/report-print-utils.ts`
- `src/components/sonoflow/ReportDownloadButton.tsx`
- `src/components/sonoflow/A4ReportPreview.tsx`
- `src/components/sonolynx/admin/BrandingSettingsManager.tsx`
- `app/api/admin/branding/route.ts`
- `supabase/migrations/20260509110000_report_templates_and_branding.sql`

### Files Modified
- `src/lib/report-template-types.ts`
- `src/lib/default-report-templates.ts`
- `src/lib/report-template-engine.ts`
- `src/lib/report-template-service.ts`
- `src/components/sonoflow/StructuredReportDialog.tsx`
- `src/components/sonoflow/ReportPreview.tsx`
- `src/components/sonolynx/admin/ReportTemplateManager.tsx`
- `app/page.tsx`
- `app/admin/page.tsx`

### API Routes Added/Changed
- Added: `app/api/admin/branding/route.ts`
  - `GET`: admin-only read of branding settings
  - `POST`: admin-only update of branding settings
  - Server-side admin validation via `user_roles`
  - Input sanitization for logo URL and text fields

### Migrations Added
- `supabase/migrations/20260509110000_report_templates_and_branding.sql`
  - Adds `report_templates` table
  - Adds `report_branding_settings` table
  - Enables RLS and policies:
    - Admins manage templates/branding
    - Authenticated users read active templates and branding settings
  - Adds helpful indexes for template filtering and branding reads

### Report Templates Added (8 Premade)
1. Standard Ultrasound Report (basic)
2. Clinic Compact Report (clinic)
3. Hospital Formal Report (hospital)
4. Radiology Department Report (hospital)
5. Abdomen Complete Template (clinic)
6. Thyroid Nodule Template (clinic)
7. OB Basic Template (hospital)
8. Vascular Doppler Template (hospital)

### Tier Access Foundation
- Added tiers: `basic`, `clinic`, `hospital`, `enterprise`
- Added helpers:
  - `getAvailableTemplatesForTier(tier, examType)`
  - `canUseTemplate(template, tier)`
  - `shouldShowSonolynxBranding(tier, brandingSettings)`
- Current development tier defaults to `hospital` with TODO for billing integration in Step 3.

### Branding / Logo Behavior
- Added admin Branding Settings panel:
  - hospital name/address/phone/email/website
  - footer text
  - show Sonolynx branding toggle
  - logo URL input and image upload fallback (stored as data URL when used)
- Branding is applied to report template rendering.
- If branding is unavailable, system falls back to safe defaults.

### A4 Preview + Download/Print
- Added A4 preview component using print-safe structure.
- Added `Download / Print PDF` action using browser print window and A4 CSS.
- Multi-page handling uses browser print flow with section break controls (`break-inside` / `page-break-inside`) and natural page continuation.

### Existing Pipeline Safety
- Existing worksheet capture flow unchanged.
- Existing `report-engine.ts` clinical generation unchanged and remains source of truth.
- Signing flow unchanged.
- HL7 generation unchanged and still uses clean text report content.
- DICOM/auth/admin core routes unchanged outside new branding route.

### Validation
- `npm exec tsc -- --noEmit`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS with existing warning only in `src/components/sonolynx/Logo.tsx`

### Known Limitations / Fallbacks
- Supabase Storage upload is not wired; branding uses URL/data URL input fallback.
- If `report_templates` or `report_branding_settings` tables are not yet migrated, services fall back to code defaults and local-safe behavior.
- Billing/payment enforcement is not implemented by design in this step.

## 2026-05-09 - Developer Provisioning + Premises Boundary (Admin/Staff/Patient Isolation)

### What changed
Implemented a developer-only provisioning flow and added organization/premises boundaries so admins and staff are scoped to their own hospital/premises data domain.

### Why it changed
To enforce operational separation between hospitals/premises:
- Developers can bootstrap a premises with an initial admin.
- Admins can manage only users inside their own premises.
- Patient/worklist and admin operational views are restricted to the current premises boundary.

### Files created
- `app/developer/page.tsx`
- `app/api/developer/provision-admin/route.ts`
- `src/lib/org-scope.ts`
- `supabase/migrations/20260509130000_organizations_and_boundaries.sql`

### Files modified
- `app/api/admin/create-user/route.ts`
- `app/api/admin/delete-user/route.ts`
- `app/admin/page.tsx`
- `app/page.tsx`
- `src/components/sonoflow/PatientWorklist.tsx`
- `src/components/sonolynx/RegisterPatientDialog.tsx`
- `src/lib/hl7-service.ts`
- `src/lib/branding-service.ts`
- `src/lib/report-template-service.ts`
- `app/api/admin/branding/route.ts`
- `supabase/migrations/20260509110000_report_templates_and_branding.sql`

### API routes added/changed
- Added: `POST /api/developer/provision-admin`
  - Developer credentials check via env vars (`DEVELOPER_PORTAL_USERNAME`, `DEVELOPER_PORTAL_PASSWORD`)
  - Creates organization/premises
  - Creates bootstrap admin user in that organization
- Changed: `POST /api/admin/create-user`
  - New staff users inherit admin's organization boundary
- Changed: `POST /api/admin/delete-user`
  - Blocks deletion of users outside admin's organization boundary
- Changed: `GET/POST /api/admin/branding`
  - Branding read/write is scoped to admin's organization boundary

### Migrations added/changed
- Added: `20260509130000_organizations_and_boundaries.sql`
  - Creates `organizations` table
  - Adds `organization_id` to `profiles`, `patients`, `studies`, `worksheets`, `hl7_messages`
  - Backfills existing records to default organization
  - Adds org indexes
- Updated: `20260509110000_report_templates_and_branding.sql`
  - Adds `organization_id` support for templates/branding tables and indexes

### Boundary behavior implemented
- Admin dashboard counts and staff/HL7 queries are organization-scoped.
- Doctor list on workspace assignment is organization-scoped.
- Patient registration inserts patient/study with organization_id.
- Worklist reads only patients in current organization.
- HL7 messages now include organization_id on insert.

### Validation results
- `npm exec tsc -- --noEmit`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS with existing warning only in `src/components/sonolynx/Logo.tsx`

### Known limitations / fallbacks
- RLS policy hardening for strict org-level row access across all tables is not fully rewritten in this patch to avoid disrupting current working clinical flow.
- Current barriers are enforced through provisioning links, scoped inserts, scoped operational queries, and admin API boundary checks.
- Existing generated Supabase TypeScript types lag behind new migration columns; affected queries use safe untyped access in bounded locations.

## 2026-05-10 - Admin Reliability + Logout Stability + Next.js Warning Cleanup

### What changed
Stabilized admin/dashboard behavior, fixed stuck auth-loading/logout experience, hardened report template tab fallbacks, and resolved the remaining Next.js lint warning from the logo image usage.

### Why it changed
- Admin dashboard was showing empty states when `organization_id` was missing on the current admin profile.
- Some sessions could appear stuck due to auth-loading not clearing after failed auth/profile calls.
- Report template manager could appear empty if DB persistence was unavailable/scoped data returned nothing.
- Lint baseline still had one Next.js `no-img-element` warning.

### Files modified
- `src/lib/auth-context.tsx`
- `app/admin/page.tsx`
- `src/lib/report-template-service.ts`
- `src/components/sonolynx/admin/ReportTemplateManager.tsx`
- `src/components/sonolynx/Logo.tsx`

### Behavior updates
- `auth-context` now always settles loading state, including failure paths and auth listener transitions.
- Access-denied admin view now includes a direct logout action.
- Admin metrics/staff/HL7 queries now gracefully fall back to non-org-scoped reads when org link is missing, instead of hard-empty dashboards.
- Report template service now queries by `organization_id` when present and safely falls back otherwise.
- Report template manager now:
  - shows loading state,
  - falls back to default templates when DB data is unavailable,
  - shows explicit fallback messaging to admins.
- Logo component now uses `next/image` instead of raw `<img>`.

### Pricing/tier rollback confirmation
- The recent clinic/hospital pricing-limit implementation was removed:
  - removed pricing helper and migration,
  - removed plan-tier checks from provisioning/admin create/extract flows,
  - restored template tier behavior to development default.

### Validation results
- `npm.cmd exec tsc -- --noEmit`: PASS
- `npm.cmd run build`: PASS
- `npm.cmd run lint`: PASS (no warnings)


## 2026-05-11 - Organization Boundary Permanent Fix + Infrastructure Stabilization

### Summary
Resolved critical data isolation and infrastructure issues that were causing deployment failures and hidden data states. Fixed the 'Organization boundary not found' error by ensuring the database schema matches the application logic and adding robust client-side fallbacks.

### Files Created
- supabase/migrations/20260511200000_fix_org_rls_and_backfill.sql
- docs/ORGANIZATION_BOUNDARIES.md
- docs/INFRASTRUCTURE_STABILIZATION.md

### Files Modified
- src/lib/org-scope.ts
- src/components/sonoflow/PatientWorklist.tsx
- src/components/sonolynx/RegisterPatientDialog.tsx
- fly.toml

### Critical Fixes
- **Database Schema**: Created the missing 'organizations' table in the live Supabase environment and added the required RLS 'SELECT' policy for authenticated users.
- **Data Backfill**: Permanently linked all existing profiles, patients, and studies to a 'Default Organization' to restore data visibility.
- **Code Simplification**: Removed complex client-side fallback hacks in favor of a clean, resilient organization detection utility.
- **Self-Healing**: Implemented automatic profile updates for Admin users to link them to valid organizations upon login.
- **Deployment**: Renamed app to 'sonolynx-app' and optimized build-time OpenAI initialization to prevent CI/CD failures.

### Infrastructure
- Verified cold-start latency reduction (<1s).
- Stabilized remote build pipeline with Consolidated build args.


## 2026-05-11 - Version 1.3.0 - Template Architect & Section Builder Release

### Summary
Introduced a revolutionary "Dynamic Template Architect" system that transforms radiology reporting from static text to a modular, logic-aware "Section Builder" experience. Admins can now design complex clinical reports with drag-and-drop hierarchy, conditional clinical logic, and premium visual themes.

### Files Created
- src/components/sonoflow/A4TemplatePreview.tsx

### Files Modified
- src/components/sonolynx/admin/ReportTemplateManager.tsx
- src/lib/report-template-types.ts
- src/lib/report-template-engine.ts
- src/lib/report-template-service.ts
- src/lib/default-report-templates.ts
- docs/SONOLYNX_CORE_DOCUMENTATION.md

### Key Features
- **Section Builder UI**: Reorderable "Section Manager" with drag-and-drop hierarchy and glassmorphism token library.
- **Conditional Clinical Logic**: Per-section rule builder (IF field > value THEN APPEND text) for dynamic clinical findings (e.g., FNA alerts for thyroid nodules).
- **Premium Visual Themes**: 9 distinct, CSS-driven layout styles (Modernist, Formalist, Academic, Minimalist, Executive, Standard, Paediatric, Vascular, Thyroid Tiered).
- **Customization Engine**: Granular control over accent colors, header backgrounds, font families (Sans/Serif/Mono), font sizes, and page margins.
- **Live A4 Preview**: Real-time rendering of the actual A4 paper output directly in the editor.
- **Persistence Fix**: Resolved a duplicate template bug by synchronizing local and database IDs during creation.
