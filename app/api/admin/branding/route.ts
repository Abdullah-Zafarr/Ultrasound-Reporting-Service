import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { ensureUserOrganization } from "@/lib/org-provision-server";
import type { ReportBrandingSettings } from "@/lib/report-template-types";

async function ensureAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, status: 401, error: "Unauthorized" };

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin");

  if (!roles || roles.length === 0) {
    return { ok: false as const, status: 403, error: "Forbidden: admin role required" };
  }

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("organization_id, email")
    .eq("id", user.id)
    .maybeSingle();

  let organizationId: string | null = profile?.organization_id ?? null;

  if (!organizationId) {
    // Auto-provision using service role to bypass RLS
    const email = profile?.email ?? user.email ?? "";
    organizationId = await ensureUserOrganization(user.id, email);
  }

  if (!organizationId) {
    return { ok: false as const, status: 400, error: "Unable to resolve organization. Please try again." };
  }

  return { ok: true as const, supabase, user, organizationId };
}

function sanitizeInput(input: ReportBrandingSettings): ReportBrandingSettings {
  const logoUrl = (input.logoUrl || "").trim();
  const allowed = logoUrl.startsWith("http://") || logoUrl.startsWith("https://") || logoUrl.startsWith("data:image/");
  return {
    hospitalName: (input.hospitalName || "").trim(),
    hospitalAddress: (input.hospitalAddress || "").trim(),
    hospitalPhone: (input.hospitalPhone || "").trim(),
    hospitalEmail: (input.hospitalEmail || "").trim(),
    hospitalWebsite: (input.hospitalWebsite || "").trim(),
    logoUrl: allowed ? logoUrl : "",
    showSonolynxBranding: Boolean(input.showSonolynxBranding),
    footerText: (input.footerText || "").trim(),
  };
}

export async function GET() {
  const auth = await ensureAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const db = auth.supabase as any;
    const { data, error } = await db
      .from("report_branding_settings")
      .select("*")
      .eq("organization_id", auth.organizationId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data: data ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await ensureAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = (await request.json()) as ReportBrandingSettings;
    const payload = sanitizeInput(body);
    const db = auth.supabase as any;

    const { data: existing } = await db
      .from("report_branding_settings")
      .select("id")
      .eq("organization_id", auth.organizationId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const record = {
      hospital_name: payload.hospitalName,
      hospital_address: payload.hospitalAddress,
      hospital_phone: payload.hospitalPhone,
      hospital_email: payload.hospitalEmail,
      hospital_website: payload.hospitalWebsite,
      logo_url: payload.logoUrl,
      footer_text: payload.footerText,
      show_sonolynx_branding: payload.showSonolynxBranding,
      organization_id: auth.organizationId,
      created_by: auth.user.id,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existing?.id) {
      result = await db.from("report_branding_settings").update(record).eq("id", existing.id).select("*").single();
    } else {
      result = await db.from("report_branding_settings").insert(record).select("*").single();
    }
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected server error" }, { status: 500 });
  }
}
