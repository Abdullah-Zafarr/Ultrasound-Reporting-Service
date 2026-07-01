# Sonolynx Project Changelog

Date: 2026-05-15

This file records the fixes made in this workspace copy of the project:
`C:\Users\USER\Documents\Codex\2026-05-15\open-this-in-workspace-c-users\Ultrasound-Worksheet-Workflow-main`.

## Current Fix: Sonographer Worksheet Persistence Into Doctor Preview

### Root Cause

The live database still stores worksheet payloads in the legacy `worksheets.form_data` column. The newer application code expected modern worksheet columns such as `worksheets.data` and `worksheets.patient_id`, but database reads confirmed those columns do not exist in the current Supabase schema. That mismatch meant saved sonographer payloads could be missed or future saves could fail before assignment.

There was also a smaller workflow issue: `Send to Doctor` saved the draft but did not keep the saved worksheet returned from that operation for the rest of the assignment flow. The doctor preview also regenerated from local state only and did not use the persisted `report_text` when one was already saved.

### Files Changed

#### `src/lib/worksheet-service.ts`

- Added payload normalization so loaded worksheet rows work with either `data` or legacy `form_data`.
- Added support for legacy rows where `form_data` may contain the exam section directly instead of the full `{ abdomen, thyroid, ob, vascular }` payload.
- Changed `loadWorksheet()` to return a normalized `WorksheetRecord` whose `data` field is always usable by the UI.
- Changed `saveDraftWorksheet()` to try the modern `data` column first, then automatically retry with `form_data` only if Supabase reports that the `data` column is missing.
- Changed `markWorksheetSigned()` to use the same compatibility fallback.
- Extended save/sign compatibility to omit missing optional workflow columns such as `patient_id` when the live database is still on the older worksheet table shape.
- Added a `getReportHistory()` fallback that resolves study IDs from `studies.patient_id` when `worksheets.patient_id` does not exist.
- Normalized `updateWorksheetStatus()` return values so state stays consistent after status updates.
- Why: doctors must be able to load sonographer worksheet data from the live legacy schema, and saves must not fail just because the database migration has not added `data` yet.

#### `app/page.tsx`

- Added `hasPersistedSection()` to avoid overwriting worksheet defaults with empty legacy payload sections.
- Changed worksheet hydration to use the normalized payload returned by `loadWorksheet()`.
- When a doctor/radiologist opens a saved worksheet, the preview now loads persisted `report_text` when available, preserving the exact text sent by the sonographer.
- Changed `handleSaveDraft()` to return the saved worksheet record.
- Changed `handleSendToDoctor()` to use that returned saved worksheet for assignment/audit logging instead of stale React state.
- Clears edited report text when no worksheet exists for the selected study.
- Added a non-fatal catch around report history loading.
- Why: fixes the send/load handoff so the doctor sees the saved sonographer report and the assignment flow references the actual persisted worksheet.

#### `src/components/sonoflow/PatientWorklist.tsx`

- Added `assigned_to` to the nested studies query.
- Added role-aware study selection for the worklist.
- Doctors/radiologists now prefer a study assigned to their user, especially `review_pending` studies.
- Falls back to review-pending or the first available study when no assigned match exists.
- Added a retry path when `patients.organization_id` does not exist (older DB schema), so the worklist still loads real patients instead of falling back to mock data.
- Why: prevents a doctor from opening the correct patient but the wrong study when a patient has more than one study.

#### `supabase/migrations/20260515172000_worksheet_payload_compatibility.sql`

- Added a new compatibility migration.
- Adds missing worksheet workflow columns if needed: `patient_id`, `user_id`, `created_by`, `worksheet_type`, `data`, `report_text`, `signed_by`, and `signed_at`.
- Backfills `data` from `form_data`.
- Backfills `patient_id`, `user_id`, and `created_by` from existing study/sonographer fields.
- Adds indexes for patient, study, user, and worksheet type lookups.
- Ensures `sonographer` and `radiologist` enum roles exist.
- Why: gives the database a forward migration path so the modern app schema and legacy data both work.

#### `src/integrations/supabase/types.ts`

- Updated generated Supabase typings for worksheet workflow fields.
- Added patient/profile/study organization and assignment fields used by the app.
- Added modern worksheet fields while keeping `data` optional because the live database may still be on the legacy schema.
- Added `radiologist` and `sonographer` to the `app_role` enum type.
- Why: keeps TypeScript aligned with the database fields the app now reads and writes.

#### `query_db.cjs`

- Removed hardcoded Supabase service credentials.
- Added `.env` loading for `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Kept the worksheet inspection query.
- Why: debug scripts should use environment variables instead of committing secrets.

#### `query_db2.cjs`

- Removed hardcoded Supabase service credentials.
- Added `.env` loading.
- Changed the query so it no longer assumes the modern `data` column exists.
- Why: the script now works against the current legacy schema and does not expose credentials.

#### `changelog.md`

- Added this root changelog.
- Why: requested by the user as a complete record of what changed and why.

## Earlier Fixes From This Workspace Pass

#### `.env`

- Created a local environment file with placeholders for Supabase, OpenAI, Gladia, DICOM, HL7, report API, developer portal, and admin settings.
- Why: gives the app one local place for runtime configuration and secrets.

#### `.env.example`

- Added missing server and client environment variables.
- Added `NEXT_PUBLIC_DEV_BYPASS_AUTH` (defaults off) so local dev behaves like real RLS unless explicitly bypassed.
- Why: documents all required configuration without storing real secrets.

#### `src/lib/auth-context.tsx`

- Disabled implicit dev-mode “fake user” auth; bypass now requires `NEXT_PUBLIC_DEV_BYPASS_AUTH=true`.
- Why: without a real Supabase session, all queries run as `anon` and RLS hides worksheets/reports, which looks like “doctor can’t see sonographer data”.

#### `.gitignore`

- Added `output.txt`.
- Why: keeps local/debug output out of source control.

#### `package.json`

- Added `typecheck` script.
- Added `validate:rules` script.
- Why: makes TypeScript and clinical-rule validation easy to run consistently.

#### `tsconfig.json`

- Added app, script, Next, ESLint, and Node-related includes/types.
- Why: ensures TypeScript checks the actual Next.js application and scripts.

#### `components.json`

- Changed the Tailwind CSS path from missing `src/styles.css` to `app/globals.css`.
- Why: aligns component tooling with the actual stylesheet.

#### `README.md`

- Updated setup/environment documentation.
- Fixed the core documentation link.
- Added quality command notes.
- Why: makes local setup and verification clearer.

#### `docs/DEPLOYMENT_GUIDE.md`

- Added deployment/build environment variable guidance.
- Added Fly secret examples for server-side values.
- Why: production builds need the same configuration now documented locally.

#### `app/api/extract/route.ts`

- Added Supabase user authentication.
- Added `OPENAI_API_KEY` validation before OpenAI client use.
- Added input validation for dictated text.
- Added active exam type context to the extraction prompt.
- Why: protects the AI extraction endpoint and improves structured extraction accuracy.

#### `app/api/gladia/live/route.ts`

- Added Supabase user authentication before issuing Gladia live sessions.
- Why: prevents unauthenticated users from creating speech-to-text sessions.

#### `app/admin/page.tsx`

- Wrapped `loadAll` in `useCallback`.
- Fixed effect dependencies that referenced `loadAll`.
- Why: removes React hook dependency warnings and stabilizes admin reload behavior.

#### `app/page.tsx`

- Removed a stale hook dependency suppression before the current persistence work.
- Why: keeps lint honest around worksheet loading behavior.

#### `src/components/sonolynx/TemplateSelector.tsx`

- Wrapped `fetchTemplates` in `useCallback`.
- Fixed effect dependencies.
- Why: removes React hook dependency warnings and avoids stale template fetches.

#### `src/lib/clinical-validator.ts`

- Fixed thyroid isthmus validation units.
- The validator now treats isthmus measurements as millimeters instead of dividing them as centimeters.
- Why: prevents false validation failures for valid thyroid measurements.

#### `scripts/random-findings-validation.ts`

- Updated imports to use `validateExamWorksheet()`.
- Removed stale default worksheet usage.
- Updated issue checks to use `issue.level`.
- Why: makes the randomized clinical rule validation script match the current validator API.

#### `supabase/migrations/20260509202000_report_templates.sql`

- Replaced a legacy report-template migration with a safe compatibility no-op.
- Why: avoids fresh migration failures from old columns that no longer match the current report template schema.

## Verification Run

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed after the persistence patch.
- `npm.cmd run validate:rules` passed with 2500 randomized abdomen cases and 2500 randomized thyroid cases.
- `npm.cmd run build` passed with the local `.env` file loaded by Next.js.
- `node query_db2.cjs` passed after the debug script was moved to `.env` credentials and made compatible with the legacy worksheet schema.

## Modules To Retest Manually

- Sonographer Clinical Worksheet: enter abdomen values, especially Liver size, then use Send to Doctor.
- Doctor Worklist: open the assigned patient/study and confirm the Report Preview displays the saved sonographer findings.
- Doctor Report Preview edit/sign flow: confirm saved report text remains visible and can be finalized.
- Draft save/load: save a draft, change patients, reopen the same study, and confirm worksheet state hydrates.
- Admin Staff/Role Management: quick smoke test after hook dependency cleanup.
- AI dictation extraction and Gladia live dictation: quick auth smoke test if API keys are present.

---

## [2026-05-15] — Doctor Worklist & Worksheet Sync — Round 2

### 🔴 Critical Bug Fixes

#### `studies.updated_at` Does Not Exist — Doctor Worklist Hard Crash
- **Symptom**: Doctor opens the app and sees "Worklist fetch failed: column studies.updated_at does not exist" (error code `42703`).
- **Root cause**: `fetchDoctorWorklist` in `PatientWorklist.tsx` was selecting and ordering by `updated_at`, but the live `studies` table uses `study_date` instead.
- **Fix**: Changed both the SELECT field list and the ORDER BY to use `study_date`.

#### `has_role()` Silently Returning `false` for Sonographers & Radiologists
- **Root cause**: The `app_role` enum was created with only `'admin'` and `'doctor'`. RLS policies using `has_role(uid, 'sonographer')` silently returned `false`, blocking sonographers from updating studies (i.e., assigning them to a doctor).
- **Fix** (`20260515220000_fix_has_role_enum.sql`):
  - Added `'sonographer'` and `'radiologist'` to the `app_role` enum via `ALTER TYPE … ADD VALUE IF NOT EXISTS`.
  - Rewrote `has_role()` to check both the `user_roles` table AND `profiles.role` text column.
  - Backfilled `user_roles` rows for all existing users whose role was only stored in `profiles`.

#### Sonographer "Send to Doctor" — Silently Blocked by RLS
- **Root cause**: The studies UPDATE policy required `assigned_to IS NULL OR assigned_to = auth.uid()`. Sonographers have neither, so the UPDATE silently wrote 0 rows and no error was raised.
- **Fix** (`20260515210000_diagnostic_and_fix.sql`): Rewrote studies UPDATE policy to include `has_role(uid, 'sonographer')`.

#### Doctors Not Showing in "Send to Doctor" Dropdown
- **Root cause**: Every new user auto-provisions their own organization. The `loadDoctors` query was client-side filtered to only show doctors in the same org as the sonographer. Doctor and sonographer had different orgs, so the list was empty.
- **Fix** (`app/page.tsx`): Removed the org filter — all users with `role = 'doctor'` or `role = 'radiologist'` are now shown in the dropdown.

#### `hl7_messages` Schema Cache Error on Sign & Send ("Failed to assign")
- **Symptom**: Toast showed "Failed to assign — Could not find the 'organization_id' column of 'hl7_messages' in the schema cache".
- **Root cause**: Columns added to `hl7_messages` via migration (`organization_id`, `patient_id`, `endpoint_url`, `sent_by`) exist in Postgres but PostgREST's schema cache had not refreshed, causing `PGRST204`.
- **Fix** (`hl7-service.ts`): Added schema-fallback retry in `createPendingHl7Message`. If the full INSERT fails with a schema cache error (`PGRST204` / `42703`), it automatically retries with only the original columns (`study_id`, `worksheet_id`, `message_type`, `payload`, `status`), keeping the Sign & Send flow functional.

#### Error Toast Showing No Message (`[sendToDoctor] Error: {}`)
- **Root cause**: Supabase error objects are plain objects `{ code, message, details }`, not JS `Error` instances. `console.error("Error:", supabaseError)` serializes as `{}`. The `.message` extraction worked, but the console label `[sendToDoctor]` was pointing to the wrong handler.
- **Fix** (`app/page.tsx`):
  - `handleConfirmSignAndSend` catch block now correctly labels log as `[sign-and-send]` and uses `JSON.stringify(error)` as fallback.
  - `handleSendToDoctor` catch block now uses same pattern for consistent diagnostics.
  - Both toast messages now surface the actual error text from Supabase.

### 🟡 Schema Migrations Applied

| File | Purpose |
|---|---|
| `20260515210000_diagnostic_and_fix.sql` | Added `active_worksheet_id` to studies; widened status CHECK constraints on worksheets and hl7_messages; fixed RLS for sonographer study updates and doctor worksheet reads |
| `20260515220000_fix_has_role_enum.sql` | Extended `app_role` enum; rewrote `has_role()`; backfilled `user_roles` |

### 🟢 New Features

#### Deterministic Worksheet Loading for Doctors
- `studies.active_worksheet_id` column added — pinned to the exact worksheet the sonographer sent.
- `handleSendToDoctor` writes this ID on assignment.
- Doctor's worksheet load effect reads `active_worksheet_id` first; falls back to most-recent if not set.

#### Doctor Worklist — Real-time + Auto-Refresh
- Supabase Realtime subscription on `studies WHERE assigned_to = uid`.
- 30-second polling fallback.
- Manual ↻ Refresh button in worklist header.

#### Worklist Error Visibility
- DB/RLS errors now surface directly in the worklist UI panel with a Retry button.
- Debug info (query, error code) shown in empty state to speed up diagnosis.

#### `updateWorksheetStatus` — CHECK Constraint Graceful Degradation
- If DB still has narrow CHECK (`'draft'`/`'signed'` only), `'transmitted'` → `'signed'` and `'failed'` → `'draft'` rather than throwing.

