"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function DeveloperProvisionPage() {
  const [developerUsername, setDeveloperUsername] = useState("");
  const [developerPassword, setDeveloperPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/developer/provision-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developerUsername,
          developerPassword,
          organizationName,
          adminEmail,
          adminPassword,
          adminFirstName,
          adminLastName,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Provision failed.");
      }
      setMessage(`Provisioned ${data.organizationName} with admin ${data.adminEmail}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Provision failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Card className="space-y-4 p-6">
        <h1 className="text-xl font-semibold">Developer Provisioning</h1>
        <p className="text-sm text-muted-foreground">
          Developer-only screen to create a new premises (organization) and bootstrap an admin account.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Developer Username" value={developerUsername} onChange={setDeveloperUsername} />
          <Field label="Developer Password" value={developerPassword} onChange={setDeveloperPassword} type="password" />
          <Field label="Organization / Hospital Name" value={organizationName} onChange={setOrganizationName} />
          <Field label="Admin Email" value={adminEmail} onChange={setAdminEmail} />
          <Field label="Admin Password" value={adminPassword} onChange={setAdminPassword} type="password" />
          <Field label="Admin First Name" value={adminFirstName} onChange={setAdminFirstName} />
          <Field label="Admin Last Name" value={adminLastName} onChange={setAdminLastName} />
        </div>

        <Button onClick={submit} disabled={saving}>
          {saving ? "Provisioning..." : "Create Premises + Admin"}
        </Button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </Card>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} type={type} />
    </div>
  );
}
