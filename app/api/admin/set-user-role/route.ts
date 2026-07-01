import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * POST /api/admin/set-user-role
 * Body: { userId: string, role: "doctor" | "sonographer" | "radiologist" | "admin" }
 * Only callable by the SUPER_ADMIN_EMAIL. Enforced server-side.
 */
export async function POST(request: Request) {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey      = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey         = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!superAdminEmail || !supabaseUrl || !serviceKey || !anonKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify caller is super admin
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized — no session" }, { status: 401 });
  }

  const anonSb = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: { user } } = await anonSb.auth.getUser();
  if (!user?.email || user.email.toLowerCase() !== superAdminEmail.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden — super admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, role } = body as { userId: string; role: string };

  const validRoles = ["doctor", "sonographer", "radiologist", "admin"];
  if (!userId || !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid userId or role" }, { status: 400 });
  }

  // Use service role to update the profile
  const serviceSb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  }) as any;

  const { data, error } = await serviceSb
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("id, email, role, first_name, last_name")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, profile: data });
}
