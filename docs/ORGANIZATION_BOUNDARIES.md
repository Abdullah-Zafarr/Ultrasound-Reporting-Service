# Organization Boundaries & Multi-Tenancy

This document outlines the security model for data isolation in Sonolynx.

## Data Isolation Model
The platform uses a per-row `organization_id` to partition data. All critical tables are linked to an organization:
- `patients`
- `studies`
- `worksheets`
- `report_templates`

## Enforcement
Isolation is enforced at two levels:
1. **Frontend Filtering**: Components like `PatientWorklist` use the `getEffectiveOrganizationId()` helper to scope queries.
2. **Resilience Fallback**: Admins have a bypass fallback to ensure system stability even if profile links are missing.

## Self-Healing
The `org-scope.ts` module contains self-healing logic that links unassigned admins to the default organization upon login.
