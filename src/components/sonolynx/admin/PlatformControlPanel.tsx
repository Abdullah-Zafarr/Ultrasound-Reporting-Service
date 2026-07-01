"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Crown, Shield, Zap, RefreshCw, Save, Users, Building2 } from "lucide-react";
import type { OrganizationTier } from "@/lib/org-scope";

interface OrgRow {
  id: string;
  name: string | null;
  tier: OrganizationTier;
}

interface ProfileRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  organization_id: string | null;
}

const TIER_LABELS: Record<OrganizationTier, { label: string; icon: React.ReactNode; color: string }> = {
  individual:   { label: "Individual",   icon: <Zap className="h-3.5 w-3.5" />,    color: "bg-slate-100 text-slate-700" },
  professional: { label: "Clinic", icon: <Shield className="h-3.5 w-3.5" />,  color: "bg-blue-100 text-blue-700" },
  enterprise:   { label: "Enterprise",   icon: <Crown className="h-3.5 w-3.5" />,   color: "bg-amber-100 text-amber-700" },
};

const VALID_ROLES = ["doctor", "sonographer", "radiologist", "admin"] as const;

async function getAuthHeader(): Promise<string | null> {
  const { data: { session } } = await (supabase as any).auth.getSession();
  return session?.access_token ? `Bearer ${session.access_token}` : null;
}

export function PlatformControlPanel() {
  const [orgs, setOrgs]       = useState<OrgRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Track pending changes without saving immediately
  const [pendingTiers, setPendingTiers]   = useState<Record<string, OrganizationTier>>({});
  const [pendingRoles, setPendingRoles]   = useState<Record<string, string>>({});
  const [saving, setSaving]               = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    const db = supabase as any;

    const [orgsRes, profilesRes] = await Promise.all([
      db.from("organizations").select("id, name, tier").order("name"),
      db.from("profiles").select("id, email, first_name, last_name, role, organization_id").order("created_at"),
    ]);

    if (orgsRes.data) {
      setOrgs(orgsRes.data.map((o: any) => ({
        ...o,
        tier: (o.tier as OrganizationTier) ?? "individual",
      })));
    }
    if (profilesRes.data) setProfiles(profilesRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const saveOrgTier = async (orgId: string) => {
    const tier = pendingTiers[orgId];
    if (!tier) return;

    setSaving(prev => ({ ...prev, [orgId]: true }));
    const token = await getAuthHeader();
    if (!token) { toast.error("Not authenticated"); return; }

    const res = await fetch("/api/admin/set-org-tier", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ orgId, tier }),
    });

    const json = await res.json();
    setSaving(prev => ({ ...prev, [orgId]: false }));

    if (!res.ok) {
      toast.error("Failed to update tier", { description: json.error });
    } else {
      const label = TIER_LABELS[tier]?.label ?? tier;
      toast.success(`Organization updated to ${label}`);
      setPendingTiers(prev => { const n = { ...prev }; delete n[orgId]; return n; });
      setOrgs(prev => prev.map(o => o.id === orgId ? { ...o, tier } : o));
    }
  };

  const saveUserRole = async (userId: string) => {
    const role = pendingRoles[userId];
    if (!role) return;

    setSaving(prev => ({ ...prev, [userId]: true }));
    const token = await getAuthHeader();
    if (!token) { toast.error("Not authenticated"); return; }

    const res = await fetch("/api/admin/set-user-role", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ userId, role }),
    });

    const json = await res.json();
    setSaving(prev => ({ ...prev, [userId]: false }));

    if (!res.ok) {
      toast.error("Failed to update role", { description: json.error });
    } else {
      toast.success(`Role updated to ${role}`);
      setPendingRoles(prev => { const n = { ...prev }; delete n[userId]; return n; });
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role } : p));
    }
  };

  const orgNameFor = (orgId: string | null) => {
    if (!orgId) return "—";
    return orgs.find(o => o.id === orgId)?.name ?? orgId.slice(0, 8) + "…";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        <RefreshCw className="animate-spin h-4 w-4 mr-2" /> Loading platform data…
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Super admin notice ── */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <Crown className="h-4 w-4 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 font-medium">
          Platform Control — Super Admin only. Changes take effect immediately.
        </p>
        <Button size="sm" variant="outline" className="ml-auto gap-1.5" onClick={loadData}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* ── Organization Tier Control ── */}
      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Organization Tiers</h2>
          <span className="ml-auto text-xs text-muted-foreground">{orgs.length} organizations</span>
        </div>

        {orgs.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">No organizations found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Organization</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Current Tier</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Change To</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org, i) => {
                const currentTier = org.tier;
                const pending = pendingTiers[org.id];
                const isDirty = Boolean(pending && pending !== currentTier);
                const isSaving = saving[org.id];
                const tierMeta = TIER_LABELS[currentTier] ?? TIER_LABELS.individual;

                return (
                  <tr key={org.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="p-3 font-medium">{org.name ?? org.id}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tierMeta.color}`}>
                        {tierMeta.icon} {tierMeta.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={pending ?? currentTier}
                        onChange={e => setPendingTiers(prev => ({ ...prev, [org.id]: e.target.value as OrganizationTier }))}
                        className="h-8 rounded-md border bg-background px-2 text-sm"
                      >
                        <option value="individual">Individual</option>
                        <option value="professional">Clinic</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        disabled={!isDirty || isSaving}
                        onClick={() => saveOrgTier(org.id)}
                        className="gap-1.5"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? "Saving…" : "Save"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* ── User Role Control ── */}
      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">User Role Management</h2>
          <span className="ml-auto text-xs text-muted-foreground">{profiles.length} users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Organization</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Current Role</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Change To</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((person, i) => {
                const displayName = `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim() || "—";
                const pending = pendingRoles[person.id];
                const isDirty = Boolean(pending && pending !== person.role);
                const isSaving = saving[person.id];

                return (
                  <tr key={person.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="p-3 font-medium">{displayName}</td>
                    <td className="p-3 text-muted-foreground text-xs">{person.email || "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground">{orgNameFor(person.organization_id)}</td>
                    <td className="p-3">
                      <Badge variant={person.role === "admin" ? "default" : "secondary"} className="capitalize">
                        {person.role || "—"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <select
                        value={pending ?? person.role ?? "doctor"}
                        onChange={e => setPendingRoles(prev => ({ ...prev, [person.id]: e.target.value }))}
                        className="h-8 rounded-md border bg-background px-2 text-sm"
                      >
                        {VALID_ROLES.map(r => (
                          <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        disabled={!isDirty || isSaving}
                        onClick={() => saveUserRole(person.id)}
                        className="gap-1.5"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? "Saving…" : "Save"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
