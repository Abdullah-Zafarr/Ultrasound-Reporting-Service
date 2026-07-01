import type { ReportTemplate } from "@/lib/report-template-types";
import { DEFAULT_THEME_OPTIONS } from "@/lib/report-template-types";

const now = new Date().toISOString();
function tpl(input: Omit<ReportTemplate, "createdAt" | "updatedAt">): ReportTemplate {
  return { ...input, createdAt: now, updatedAt: now };
}

export const DEFAULT_REPORT_TEMPLATES: ReportTemplate[] = [

  // ─── 1. THE MODERNIST ────────────────────────────────────────────────────────
  tpl({
    id: "tpl-modernist", name: "The Modernist",
    description: "Clean typography, generous whitespace, subtle slate-gray accents.",
    examType: "general", templateType: "premade", tierAvailability: "professional",
    supportsLogo: true, includesSonolynxBranding: true, layoutStyle: "modernist", isActive: true, createdBy: null,
    themeOptions: { ...DEFAULT_THEME_OPTIONS, accentColor: "#64748b", headerBg: "#f8fafc", headerText: "#1e293b", bodyText: "#334155" },
    sections: [
      { id: "mod-header",   title: "Practice Header",    order: 1, enabled: true, placeholders: ["{{hospitalName}}", "{{hospitalAddress}}", "{{hospitalPhone}}"], content: "{{hospitalName}}\n{{hospitalAddress}}\nT: {{hospitalPhone}}", conditionalRules: [] },
      { id: "mod-patient",  title: "Patient Information", order: 2, enabled: true, placeholders: ["{{patientName}}", "{{patientAge}}", "{{patientGender}}", "{{mrn}}", "{{studyDate}}"], content: "Patient: {{patientName}}  ·  Age: {{patientAge}}  ·  Gender: {{patientGender}}\nMRN: {{mrn}}  ·  Study Date: {{studyDate}}", conditionalRules: [] },
      { id: "mod-exam",     title: "Examination",        order: 3, enabled: true, placeholders: ["{{examType}}", "{{referringPhysician}}", "{{accession}}"], content: "Examination: {{examType}}\nReferring Physician: {{referringPhysician}}\nAccession: {{accession}}", conditionalRules: [] },
      { id: "mod-findings", title: "Findings",           order: 4, enabled: true, placeholders: ["{{findings}}"], content: "{{findings}}", conditionalRules: [] },
      { id: "mod-imp",      title: "Impression",         order: 5, enabled: true, placeholders: ["{{impression}}"], content: "{{impression}}", conditionalRules: [] },
      { id: "mod-sign",     title: "Signature",          order: 6, enabled: true, placeholders: ["{{signedBy}}", "{{signedAt}}"], content: "Reported by: {{signedBy}}\nDate: {{signedAt}}", conditionalRules: [] },
    ],
  }),

  // ─── 2. THE FORMALIST ────────────────────────────────────────────────────────
  tpl({
    id: "tpl-formalist", name: "The Formalist",
    description: "Double-bordered headers, traditional hospital formatting. Accreditation-ready.",
    examType: "general", templateType: "premade", tierAvailability: "enterprise",
    supportsLogo: true, includesSonolynxBranding: false, layoutStyle: "formalist", isActive: true, createdBy: null,
    themeOptions: { ...DEFAULT_THEME_OPTIONS, accentColor: "#1e293b", headerBg: "#1e293b", headerText: "#ffffff", bodyText: "#1a1a1a", fontFamily: "serif" },
    sections: [
      { id: "frm-inst",   title: "Institution",           order: 1, enabled: true, placeholders: ["{{hospitalName}}", "{{hospitalAddress}}", "{{hospitalPhone}}", "{{hospitalEmail}}"], content: "DEPARTMENT OF RADIOLOGY & MEDICAL IMAGING\n{{hospitalName}}\n{{hospitalAddress}}\nTel: {{hospitalPhone}}  |  Email: {{hospitalEmail}}", conditionalRules: [] },
      { id: "frm-demo",   title: "Patient Demographics",  order: 2, enabled: true, placeholders: ["{{patientName}}", "{{patientAge}}", "{{patientGender}}", "{{mrn}}"], content: "PATIENT NAME:       {{patientName}}\nAGE:                {{patientAge}}\nGENDER:             {{patientGender}}\nMEDICAL RECORD NO:  {{mrn}}", conditionalRules: [] },
      { id: "frm-study",  title: "Study Information",     order: 3, enabled: true, placeholders: ["{{accession}}", "{{examType}}", "{{studyDate}}", "{{referringPhysician}}"], content: "ACCESSION NO:       {{accession}}\nEXAMINATION:        {{examType}}\nDATE OF STUDY:      {{studyDate}}\nREFERRING CLINICIAN: {{referringPhysician}}", conditionalRules: [] },
      { id: "frm-find",   title: "Ultrasound Findings",   order: 4, enabled: true, placeholders: ["{{findings}}"], content: "ULTRASOUND FINDINGS:\n\n{{findings}}", conditionalRules: [] },
      { id: "frm-imp",    title: "Radiological Impression", order: 5, enabled: true, placeholders: ["{{impression}}"], content: "RADIOLOGICAL IMPRESSION:\n\n{{impression}}", conditionalRules: [] },
      { id: "frm-attest", title: "Attestation",           order: 6, enabled: true, placeholders: ["{{signedBy}}", "{{signedAt}}"], content: "Reviewed and verified by:\n\nDr. {{signedBy}}\nDate & Time: {{signedAt}}\n\n_________________________________\nAuthorised Signature", conditionalRules: [] },
    ],
  }),

  // ─── 3. THE ACADEMIC ─────────────────────────────────────────────────────────
  tpl({
    id: "tpl-academic", name: "The Academic",
    description: "Compact two-column layout for high-density clinical data.",
    examType: "general", templateType: "premade", tierAvailability: "enterprise",
    supportsLogo: true, includesSonolynxBranding: false, layoutStyle: "academic", isActive: true, createdBy: null,
    themeOptions: { ...DEFAULT_THEME_OPTIONS, accentColor: "#334155", headerBg: "#334155", headerText: "#ffffff", bodyText: "#111827", fontSize: "small" },
    sections: [
      { id: "acad-hdr",   title: "Institution & Study", order: 1, enabled: true, placeholders: ["{{hospitalName}}", "{{accession}}", "{{studyDate}}", "{{examType}}"], content: "{{hospitalName}}  ·  {{accession}}  ·  {{studyDate}}\nExamination: {{examType}}", conditionalRules: [] },
      { id: "acad-demo",  title: "Demographics",        order: 2, enabled: true, placeholders: ["{{patientName}}", "{{mrn}}", "{{patientAge}}", "{{patientGender}}", "{{referringPhysician}}"], content: "Name: {{patientName}}  |  MRN: {{mrn}}\nAge: {{patientAge}}  |  Sex: {{patientGender}}\nReferring: {{referringPhysician}}", conditionalRules: [] },
      { id: "acad-sum",   title: "Clinical Summary",   order: 3, enabled: true, placeholders: ["{{worksheetSummary}}"], content: "MEASUREMENT SUMMARY:\n{{worksheetSummary}}", conditionalRules: [] },
      { id: "acad-find",  title: "Findings",           order: 4, enabled: true, placeholders: ["{{findings}}"], content: "SONOGRAPHIC FINDINGS:\n{{findings}}", conditionalRules: [] },
      { id: "acad-imp",   title: "Impression",         order: 5, enabled: true, placeholders: ["{{impression}}"], content: "IMPRESSION:\n{{impression}}", conditionalRules: [] },
      { id: "acad-sign",  title: "Reporting Physician", order: 6, enabled: true, placeholders: ["{{signedBy}}", "{{signedAt}}"], content: "Reported by: {{signedBy}}  |  {{signedAt}}", conditionalRules: [] },
    ],
  }),

  // ─── 4. THE MINIMALIST ───────────────────────────────────────────────────────
  tpl({
    id: "tpl-minimalist", name: "The Minimalist",
    description: "Borderless sections, bold headings, optimized for rapid digital reading.",
    examType: "general", templateType: "premade", tierAvailability: "individual",
    supportsLogo: false, includesSonolynxBranding: true, layoutStyle: "minimalist", isActive: true, createdBy: null,
    themeOptions: { ...DEFAULT_THEME_OPTIONS, accentColor: "#0f172a", headerBg: "#ffffff", headerText: "#0f172a", bodyText: "#374151", pageMargin: "spacious" },
    sections: [
      { id: "min-meta",  title: "Meta",       order: 1, enabled: true, placeholders: ["{{patientName}}", "{{mrn}}", "{{studyDate}}", "{{examType}}"], content: "{{patientName}}  ·  {{mrn}}  ·  {{studyDate}}\n{{examType}}", conditionalRules: [] },
      { id: "min-find",  title: "Findings",   order: 2, enabled: true, placeholders: ["{{findings}}"], content: "{{findings}}", conditionalRules: [] },
      { id: "min-imp",   title: "Impression", order: 3, enabled: true, placeholders: ["{{impression}}"], content: "{{impression}}", conditionalRules: [] },
      { id: "min-sign",  title: "Signed",     order: 4, enabled: true, placeholders: ["{{signedBy}}"], content: "{{signedBy}}", conditionalRules: [] },
    ],
  }),

  // ─── 5. THE EXECUTIVE ────────────────────────────────────────────────────────
  tpl({
    id: "tpl-executive", name: "The Executive",
    description: "High-contrast Midnight slate headers, vibrant status badges. Premium private practice.",
    examType: "general", templateType: "premade", tierAvailability: "enterprise",
    supportsLogo: true, includesSonolynxBranding: false, layoutStyle: "executive", isActive: true, createdBy: null,
    themeOptions: { ...DEFAULT_THEME_OPTIONS, accentColor: "#3b82f6", headerBg: "#0f172a", headerText: "#f8fafc", bodyText: "#1e293b" },
    sections: [
      { id: "exec-hdr",    title: "Executive Header",   order: 1, enabled: true, placeholders: ["{{hospitalName}}", "{{hospitalAddress}}", "{{hospitalPhone}}"], content: "{{hospitalName}}\n{{hospitalAddress}}\n{{hospitalPhone}}", conditionalRules: [] },
      { id: "exec-pat",    title: "Patient Profile",    order: 2, enabled: true, placeholders: ["{{patientName}}", "{{patientAge}}", "{{patientGender}}", "{{mrn}}", "{{studyDate}}"], content: "{{patientName}}\nAge {{patientAge}}  ·  {{patientGender}}  ·  MRN {{mrn}}\nStudy Date: {{studyDate}}", conditionalRules: [] },
      { id: "exec-ref",    title: "Referral",           order: 3, enabled: true, placeholders: ["{{referringPhysician}}", "{{accession}}", "{{examType}}"], content: "Referring Clinician: {{referringPhysician}}\nAccession: {{accession}}  ·  {{examType}}", conditionalRules: [] },
      { id: "exec-sum",    title: "Clinical Summary",   order: 4, enabled: true, placeholders: ["{{worksheetSummary}}"], content: "{{worksheetSummary}}", conditionalRules: [] },
      { id: "exec-find",   title: "Detailed Findings",  order: 5, enabled: true, placeholders: ["{{findings}}"], content: "{{findings}}", conditionalRules: [] },
      { id: "exec-imp",    title: "Clinical Impression", order: 6, enabled: true, placeholders: ["{{impression}}"], content: "{{impression}}", conditionalRules: [] },
      { id: "exec-sign",   title: "Authorization",      order: 7, enabled: true, placeholders: ["{{signedBy}}", "{{signedAt}}"], content: "Authorized & Signed: {{signedBy}}\nTimestamp: {{signedAt}}", conditionalRules: [] },
    ],
  }),

  // ─── 6. THE STANDARD ─────────────────────────────────────────────────────────
  tpl({
    id: "tpl-standard", name: "The Standard",
    description: "Clean, standard medical-grade formatting. Universal template for any exam type.",
    examType: "general", templateType: "premade", tierAvailability: "individual",
    supportsLogo: true, includesSonolynxBranding: true, layoutStyle: "standard", isActive: true, createdBy: null,
    themeOptions: { ...DEFAULT_THEME_OPTIONS },
    sections: [
      { id: "std-hdr",  title: "Header",    order: 1, enabled: true, placeholders: ["{{hospitalName}}", "{{patientName}}", "{{mrn}}", "{{accession}}", "{{examType}}", "{{studyDate}}"], content: "{{hospitalName}}\n\nPatient: {{patientName}}  |  MRN: {{mrn}}\nAccession: {{accession}}  |  Exam: {{examType}}  |  Date: {{studyDate}}", conditionalRules: [] },
      { id: "std-ref",  title: "Referral",  order: 2, enabled: true, placeholders: ["{{referringPhysician}}"], content: "Referring Physician: {{referringPhysician}}", conditionalRules: [] },
      { id: "std-find", title: "Findings",  order: 3, enabled: true, placeholders: ["{{findings}}"], content: "FINDINGS:\n{{findings}}", conditionalRules: [] },
      { id: "std-imp",  title: "Impression", order: 4, enabled: true, placeholders: ["{{impression}}"], content: "IMPRESSION:\n{{impression}}", conditionalRules: [] },
      { id: "std-sign", title: "Signature", order: 5, enabled: true, placeholders: ["{{signedBy}}", "{{signedAt}}", "{{sonuLabsBranding}}"], content: "Dr. {{signedBy}}  ·  {{signedAt}}\n\n{{sonuLabsBranding}}", conditionalRules: [] },
    ],
  }),

  // ─── 7. THE PAEDIATRIC ───────────────────────────────────────────────────────
  tpl({
    id: "tpl-paediatric", name: "The Paediatric",
    description: "Child-friendly clinical format with growth metrics and parental communication sections.",
    examType: "general", templateType: "premade", tierAvailability: "professional",
    supportsLogo: true, includesSonolynxBranding: false, layoutStyle: "modernist", isActive: true, createdBy: null,
    themeOptions: { ...DEFAULT_THEME_OPTIONS, accentColor: "#0ea5e9", headerBg: "#f0f9ff", headerText: "#0c4a6e", bodyText: "#1e3a5f" },
    sections: [
      { id: "ped-hdr",     title: "Clinic Header",        order: 1, enabled: true, placeholders: ["{{hospitalName}}", "{{hospitalPhone}}"], content: "{{hospitalName}}  ·  Paediatric Radiology\nContact: {{hospitalPhone}}", conditionalRules: [] },
      { id: "ped-patient", title: "Patient Details",      order: 2, enabled: true, placeholders: ["{{patientName}}", "{{patientAge}}", "{{mrn}}", "{{studyDate}}"], content: "Patient: {{patientName}}  |  Age: {{patientAge}}\nMRN: {{mrn}}  |  Date: {{studyDate}}", conditionalRules: [] },
      { id: "ped-ref",     title: "Referral",             order: 3, enabled: true, placeholders: ["{{referringPhysician}}", "{{examType}}"], content: "Examination: {{examType}}\nRequesting Clinician: {{referringPhysician}}", conditionalRules: [] },
      { id: "ped-sum",     title: "Growth & Measurements", order: 4, enabled: true, placeholders: ["{{worksheetSummary}}"], content: "GROWTH MEASUREMENTS:\n{{worksheetSummary}}", conditionalRules: [] },
      { id: "ped-find",    title: "Sonographic Findings", order: 5, enabled: true, placeholders: ["{{findings}}"], content: "{{findings}}", conditionalRules: [] },
      { id: "ped-imp",     title: "Clinical Impression",  order: 6, enabled: true, placeholders: ["{{impression}}"], content: "{{impression}}", conditionalRules: [] },
      { id: "ped-sign",    title: "Reporting Radiologist", order: 7, enabled: true, placeholders: ["{{signedBy}}", "{{signedAt}}"], content: "Dr. {{signedBy}}\n{{signedAt}}", conditionalRules: [] },
    ],
  }),

  // ─── 8. THE VASCULAR PROTOCOL ────────────────────────────────────────────────
  tpl({
    id: "tpl-vascular-protocol", name: "The Vascular Protocol",
    description: "Specialized layout for Doppler & vascular studies with velocity and resistance index fields.",
    examType: "vascular", templateType: "premade", tierAvailability: "professional",
    supportsLogo: true, includesSonolynxBranding: false, layoutStyle: "academic", isActive: true, createdBy: null,
    themeOptions: { ...DEFAULT_THEME_OPTIONS, accentColor: "#dc2626", headerBg: "#7f1d1d", headerText: "#fef2f2", bodyText: "#1c1917", fontSize: "small" },
    sections: [
      { id: "vas-hdr",  title: "Department Header",     order: 1, enabled: true, placeholders: ["{{hospitalName}}", "{{accession}}", "{{studyDate}}"], content: "VASCULAR LABORATORY — {{hospitalName}}\nAccession: {{accession}}  |  Date: {{studyDate}}", conditionalRules: [] },
      { id: "vas-pat",  title: "Patient",               order: 2, enabled: true, placeholders: ["{{patientName}}", "{{mrn}}", "{{patientAge}}", "{{referringPhysician}}"], content: "Patient: {{patientName}}  |  MRN: {{mrn}}  |  Age: {{patientAge}}\nRequesting: {{referringPhysician}}", conditionalRules: [] },
      { id: "vas-meas", title: "Haemodynamic Measurements", order: 3, enabled: true, placeholders: ["{{worksheetSummary}}"], content: "HAEMODYNAMIC DATA:\n{{worksheetSummary}}", conditionalRules: [{ id: "r1", field: "resistive_index", operator: ">", value: "0.7", thenContent: "⚠ Elevated Resistive Index noted — consider further vascular evaluation." }] },
      { id: "vas-find", title: "Doppler Findings",      order: 4, enabled: true, placeholders: ["{{findings}}"], content: "{{findings}}", conditionalRules: [] },
      { id: "vas-imp",  title: "Vascular Impression",   order: 5, enabled: true, placeholders: ["{{impression}}"], content: "{{impression}}", conditionalRules: [] },
      { id: "vas-sign", title: "Vascular Radiologist",  order: 6, enabled: true, placeholders: ["{{signedBy}}", "{{signedAt}}"], content: "Dr. {{signedBy}}  ·  {{signedAt}}", conditionalRules: [] },
    ],
  }),

  // ─── 9. THE THYROID TIERED ───────────────────────────────────────────────────
  tpl({
    id: "tpl-thyroid-tiered", name: "The Thyroid Tiered",
    description: "ACR TI-RADS driven template with built-in conditional FNA recommendation logic.",
    examType: "thyroid", templateType: "premade", tierAvailability: "enterprise",
    supportsLogo: true, includesSonolynxBranding: false, layoutStyle: "executive", isActive: true, createdBy: null,
    themeOptions: { ...DEFAULT_THEME_OPTIONS, accentColor: "#7c3aed", headerBg: "#1e1b4b", headerText: "#ede9fe", bodyText: "#1e1b4b" },
    sections: [
      { id: "thr-hdr",    title: "Clinic Header",       order: 1, enabled: true, placeholders: ["{{hospitalName}}", "{{hospitalPhone}}"], content: "{{hospitalName}}  ·  Thyroid & Endocrine Ultrasound\n{{hospitalPhone}}", conditionalRules: [] },
      { id: "thr-patient", title: "Patient",            order: 2, enabled: true, placeholders: ["{{patientName}}", "{{mrn}}", "{{patientAge}}", "{{studyDate}}"], content: "{{patientName}}  |  MRN: {{mrn}}  |  Age: {{patientAge}}\nDate: {{studyDate}}", conditionalRules: [] },
      { id: "thr-sum",    title: "Nodule Measurements", order: 3, enabled: true, placeholders: ["{{worksheetSummary}}"], content: "THYROID MEASUREMENTS:\n{{worksheetSummary}}", conditionalRules: [{ id: "r1", field: "thyroid_nodule_size", operator: ">", value: "10", thenContent: "⚠ ACR TI-RADS ALERT: Nodule >10mm. FNA biopsy recommended per current guidelines." }] },
      { id: "thr-find",   title: "Sonographic Findings", order: 4, enabled: true, placeholders: ["{{findings}}"], content: "{{findings}}", conditionalRules: [] },
      { id: "thr-imp",    title: "Impression & TI-RADS", order: 5, enabled: true, placeholders: ["{{impression}}"], content: "{{impression}}", conditionalRules: [] },
      { id: "thr-sign",   title: "Radiologist",         order: 6, enabled: true, placeholders: ["{{signedBy}}", "{{signedAt}}"], content: "Dr. {{signedBy}}  ·  {{signedAt}}", conditionalRules: [] },
    ],
  }),
];
