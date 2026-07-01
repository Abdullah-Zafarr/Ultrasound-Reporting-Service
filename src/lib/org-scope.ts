import { supabase } from "@/integrations/supabase/client";

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function getAuthedUser() {
  const db = supabase as any;
  const {
    data: { session },
  } = await db.auth.getSession();
  return { db, user: session?.user };
}

/**
 * Calls the server-side /api/setup/provision-org endpoint which uses the
 * service role key to bypass RLS and create an org for the user.
 */
async function provisionOrgViaApi(): Promise<string | null> {
  try {
    const res = await fetch("/api/setup/provision-org", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("[org-scope] provision-org API error:", body?.error ?? res.status);
      return null;
    }
    const body = await res.json();
    return (body?.organizationId as string) ?? null;
  } catch (err) {
    console.error("[org-scope] provision-org fetch failed:", err);
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the current user's organisation ID.
 * If the profile has no org yet, one is automatically created via the
 * server-side provision-org endpoint (which uses service role to bypass RLS).
 * Never returns null for authenticated users under normal conditions.
 */
export async function getCurrentUserOrganizationId(): Promise<string | null> {
  const { db, user } = await getAuthedUser();
  if (!user?.id) return null;

  const { data, error } = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[org-scope] Error fetching organization ID:", error);
  }

  if (data?.organization_id) return data.organization_id as string;

  // Fallback to "Default Organization" if it exists (avoids island creation)
  const { data: defaultOrg } = await db
    .from("organizations")
    .select("id")
    .eq("code", "default-org")
    .maybeSingle();
  
  if (defaultOrg?.id) {
    console.info("[org-scope] User", user.id, "has no org, falling back to default-org");
    return defaultOrg.id;
  }

  // No org yet and no default — provision one via the server-side API
  console.info("[org-scope] No org found and no default exists — calling provision-org API");
  return provisionOrgViaApi();
}

/** Alias kept for backward-compat with all existing call-sites. */
export const getEffectiveOrganizationId = getCurrentUserOrganizationId;

export async function getCurrentUserRole(): Promise<string | null> {
  const { db, user } = await getAuthedUser();
  if (!user?.id) return null;
  const { data } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.role ?? null;
}

// ─── Organization Tiers ────────────────────────────────────────────────────────
export type OrganizationTier = "individual" | "professional" | "enterprise";

export interface TierCapabilities {
  maxStaff: number;
  maxCustomTemplates: number;
  allowedTemplateIds: string[] | "all";
  canCreateCustomTemplates: boolean;
  canUseConditionalLogic: boolean;
}

export const TIER_CONFIG: Record<OrganizationTier, TierCapabilities> = {
  individual: {
    maxStaff: 3,
    maxCustomTemplates: 0,
    allowedTemplateIds: ["tpl-standard", "tpl-minimalist"],
    canCreateCustomTemplates: false,
    canUseConditionalLogic: false,
  },
  professional: {
    maxStaff: 15,
    maxCustomTemplates: 5,
    allowedTemplateIds: [
      "tpl-standard",
      "tpl-minimalist",
      "tpl-modernist",
      "tpl-paediatric",
      "tpl-vascular-protocol",
    ],
    canCreateCustomTemplates: true,
    canUseConditionalLogic: true,
  },
  enterprise: {
    maxStaff: Infinity,
    maxCustomTemplates: Infinity,
    allowedTemplateIds: "all",
    canCreateCustomTemplates: true,
    canUseConditionalLogic: true,
  },
};

export async function getCurrentUserOrganizationTier(): Promise<OrganizationTier> {
  try {
    const { db, user } = await getAuthedUser();
    if (!user?.id) return "enterprise";

    const { data: profile } = await db
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.organization_id) return "enterprise";

    const { data: org, error } = await db
      .from("organizations")
      .select("tier")
      .eq("id", profile.organization_id)
      .maybeSingle();

    if (error) {
      console.warn(
        "[org-scope] Could not read tier (migration pending?), defaulting to enterprise:",
        error.message,
      );
      return "enterprise";
    }

    return (org?.tier as OrganizationTier) ?? "enterprise";
  } catch (err) {
    console.warn("[org-scope] Unexpected error reading tier, defaulting to enterprise:", err);
    return "enterprise";
  }
}
