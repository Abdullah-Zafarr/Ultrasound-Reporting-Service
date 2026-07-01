import { postJson } from "@/lib/api-client";
import type { ExamType, ObData, VascularData, WorksheetData, ThyroidData } from "@/lib/sonoflow-types";
import type { ReportSections } from "@/lib/report-engine";

export async function enhanceReport(params: {
  exam: ExamType;
  localReport: ReportSections;
  worksheet: WorksheetData;
  thyroid: ThyroidData;
  ob: ObData;
  vascular: VascularData;
  additionalNotes: string;
}) {
  const externalUrl = process.env.NEXT_PUBLIC_REPORT_API_URL;
  const localUrl = "/api/report/generate";
  
  const payload = {
    exam: params.exam,
    localReport: params.localReport,
    worksheet: params.worksheet,
    thyroid: params.thyroid,
    ob: params.ob,
    vascular: params.vascular,
    additionalNotes: params.additionalNotes,
  };

  // Try external first if configured
  if (externalUrl) {
    try {
      const response = await postJson<{ report?: ReportSections }>(
        externalUrl,
        payload,
        { timeoutMs: 15000, retries: 0 },
      );

      if (response?.report?.findings && response.report.impression) {
        return { report: response.report, enhanced: true, warning: null };
      }
    } catch (error) {
      console.warn("[report-service] External API failed, falling back to local:", error);
    }
  }

  // Fallback to local API
  try {
    const response = await postJson<{ report?: ReportSections }>(
      localUrl,
      payload,
      { timeoutMs: 20000, retries: 1 },
    );

    if (response?.report?.findings && response.report.impression) {
      return { report: response.report, enhanced: true, warning: null };
    }
    return { report: params.localReport, enhanced: false, warning: "Local report enhancement returned invalid data." };
  } catch (error) {
    return {
      report: params.localReport,
      enhanced: false,
      warning: error instanceof Error ? error.message : "AI report enhancement failed.",
    };
  }
}
