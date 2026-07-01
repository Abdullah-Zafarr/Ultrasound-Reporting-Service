/**
 * Server-side organization provisioning helper.
 * Uses the service-role Supabase client to bypass RLS on the organizations table.
 * Call this from any server-side route when an admin user has no organization_id.
 */

import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createServiceClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Ensures the user has an organization. If not, creates one using the service
 * role key (which bypasses RLS) and links it to their profile.
 * Returns the organization ID, or null if provisioning fails.
 */
export async function ensureUserOrganization(
  userId: string,
  userEmail: string,
  extraProfileFields?: Record<string, string | null>,
): Promise<string | null> {
  const service = getServiceClient() as any;
  if (!service) {
    console.error("[provision] Missing service role key — cannot provision org");
    return null;
  }

  // Double-check: maybe it was just set by a concurrent request
  const { data: profile } = await service
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.organization_id) return profile.organization_id as string;

  // Create the org
  const displayName = userEmail.split("@")[0];
  const orgName = `${displayName}'s Organization`;
  const orgCode = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const { data: org, error: orgError } = await service
    .from("organizations")
    .insert({ name: orgName, code: orgCode })
    .select("id")
    .single();

  if (orgError || !org?.id) {
    console.error("[provision] Failed to create org:", orgError?.message);
    return null;
  }

  const organizationId = org.id as string;

  // Link profile
  await service.from("profiles").upsert(
    {
      id: userId,
      email: userEmail,
      organization_id: organizationId,
      ...(extraProfileFields ?? {}),
    },
    { onConflict: "id" },
  );

  console.info("[provision] Created org", organizationId, "for user", userId);
  return organizationId;
}
