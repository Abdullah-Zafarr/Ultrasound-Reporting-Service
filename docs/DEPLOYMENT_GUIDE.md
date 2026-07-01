# Deployment Guide (Fly.io)

## Prerequisites
- Fly.io CLI (`flyctl`)
- Supabase Project

## Manual Deployment
```bash
fly deploy
```

## Remote Build Arguments
Build arguments are defined in `fly.toml` for Next.js build-time static analysis:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DICOMWEB_API_URL`
- `NEXT_PUBLIC_HL7_EXPORT_API_URL`
- `NEXT_PUBLIC_REPORT_API_URL`

## Secret Management
Runtime secrets should be set via Fly secrets:
```bash
fly secrets set SUPABASE_URL=...
fly secrets set SUPABASE_SERVICE_ROLE_KEY=...
fly secrets set SUPER_ADMIN_EMAIL=...
fly secrets set DEVELOPER_PORTAL_USERNAME=...
fly secrets set DEVELOPER_PORTAL_PASSWORD=...
fly secrets set OPENAI_API_KEY=...
fly secrets set GLADIA_API_KEY=...
```

## Troubleshooting
If the app name changes, ensure your `FLY_API_TOKEN` has permissions for the new app name (`sonolynx-app`).
