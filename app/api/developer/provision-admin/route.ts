import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Payload = {
  developerUsername?: string;
  developerPassword?: string;
  organizationName?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminFirstName?: string;
  adminLastName?: string;
};

function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createServiceClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function checkDeveloperAccess(username: string, password: string) {
  const expectedUser = process.env.DEVELOPER_PORTAL_USERNAME || "";
  const expectedPass = process.env.DEVELOPER_PORTAL_PASSWORD || "";
  return expectedUser && expectedPass && username === expectedUser && password === expectedPass;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    const developerUsername = payload.developerUsername?.trim() ?? "";
    const developerPassword = payload.developerPassword?.trim() ?? "";
    if (!checkDeveloperAccess(developerUsername, developerPassword)) {
      return NextResponse.json({ error: "Invalid developer credentials." }, { status: 401 });
    }

    const organizationName = payload.organizationName?.trim() ?? "";
    const adminEmail = payload.adminEmail?.trim().toLowerCase() ?? "";
    const adminPassword = payload.adminPassword?.trim() ?? "";
    const adminFirstName = payload.adminFirstName?.trim() ?? "";
    const adminLastName = payload.adminLastName?.trim() ?? "";

    if (!organizationName || !adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const service = getServiceClient() as any;
    const { data: organization, error: organizationError } = await service
      .from("organizations")
      .insert({
        name: organizationName,
        code: organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40),
      })
      .select("*")
      .single();
    if (organizationError) {
      return NextResponse.json({ error: organizationError.message }, { status: 400 });
    }

    const createdUser = await service.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { first_name: adminFirstName, last_name: adminLastName },
    });
    if (createdUser.error || !createdUser.data.user) {
      return NextResponse.json({ error: createdUser.error?.message ?? "Failed to create admin user." }, { status: 400 });
    }

    const adminUserId = createdUser.data.user.id;
    const profileResult = await service.from("profiles").upsert(
      {
        id: adminUserId,
        email: adminEmail,
        first_name: adminFirstName,
        last_name: adminLastName,
        role: "admin",
        organization_id: organization.id,
      },
      { onConflict: "id" },
    );
    if (profileResult.error) {
      return NextResponse.json({ error: profileResult.error.message }, { status: 400 });
    }

    const roleResult = await service
      .from("user_roles")
      .upsert({ user_id: adminUserId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleResult.error) {
      return NextResponse.json({ error: roleResult.error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      organizationId: organization.id,
      organizationName: organization.name,
      adminUserId,
      adminEmail,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 },
    );
  }
}
