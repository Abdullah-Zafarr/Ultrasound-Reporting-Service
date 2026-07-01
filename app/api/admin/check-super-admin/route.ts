import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/check-super-admin
 * Returns { isSuperAdmin: boolean } — checks the current session
 * email against the SUPER_ADMIN_EMAIL environment variable server-side.
 * The actual email is never sent to the client.
 */
export async function GET() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (!superAdminEmail) {
    return NextResponse.json({ isSuperAdmin: false });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ isSuperAdmin: false });
  }

  // We need the Authorization header from the client to verify who is calling
  // The client must pass the JWT in the Authorization header
  const { headers } = await import("next/headers");
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");
  if (!authHeader) return NextResponse.json({ isSuperAdmin: false });

  const sb = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: { user } } = await sb.auth.getUser();
  if (!user?.email) return NextResponse.json({ isSuperAdmin: false });

  return NextResponse.json({
    isSuperAdmin: user.email.toLowerCase() === superAdminEmail.toLowerCase(),
  });
}
