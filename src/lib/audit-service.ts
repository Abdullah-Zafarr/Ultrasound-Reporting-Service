import type { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export async function writeAuditLog(params: {
  userId?: string | null;
  patientId?: string | null;
  studyId?: string | null;
  worksheetId?: string | null;
  hl7MessageId?: string | null;
  action: string;
  status: string;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await db.from("audit_logs").insert({
    user_id: params.userId ?? null,
    patient_id: params.patientId ?? null,
    study_id: params.studyId ?? null,
    worksheet_id: params.worksheetId ?? null,
    hl7_message_id: params.hl7MessageId ?? null,
    action: params.action,
    status: params.status,
    metadata: (params.metadata ?? {}) as Json,
  });

  if (error) {
    // Audit logging should not break clinical UI actions, but callers can inspect dev logs.
    console.warn("[Sonolynx] audit log failed", error);
  }
}
