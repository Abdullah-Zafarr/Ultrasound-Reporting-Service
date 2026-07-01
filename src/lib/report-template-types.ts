// ─── Layout Themes ────────────────────────────────────────────────────────────
export type ReportTemplateLayoutStyle =
  | "modernist"   // Clean typography, slate-gray accents, generous whitespace
  | "formalist"   // Double-bordered headers, serif-like, official hospital feel
  | "academic"    // Compact two-column, high-density clinical data
  | "minimalist"  // Borderless sections, bold headings, rapid digital reading
  | "executive"   // Midnight slate headers, vibrant status badges
  | "standard";   // Clean standard medical-grade formatting

export const LAYOUT_THEME_META: Record<ReportTemplateLayoutStyle, { label: string; description: string; icon: string }> = {
  modernist:  { label: "The Modernist",  description: "Clean typography, generous whitespace, slate-gray accents", icon: "✦" },
  formalist:  { label: "The Formalist",  description: "Double-bordered headers, traditional hospital formatting",   icon: "⊡" },
  academic:   { label: "The Academic",   description: "Two-column layout for high-density clinical data",           icon: "⊞" },
  minimalist: { label: "The Minimalist", description: "Borderless sections, bold headings, rapid digital reading",  icon: "—" },
  executive:  { label: "The Executive",  description: "Midnight slate headers with vibrant status badges",          icon: "◈" },
  standard:   { label: "The Standard",   description: "Clean, standard medical-grade formatting",                   icon: "⊟" },
};

// ─── Conditional Logic ────────────────────────────────────────────────────────
export interface ConditionalRule {
  id: string;
  field: string;          // e.g. "thyroid_nodule_size"
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
  value: string;          // numeric or string value
  thenContent: string;    // content to render if condition is true
}

// ─── Theme Customisation ──────────────────────────────────────────────────────
export interface TemplateThemeOptions {
  accentColor: string;      // hex, e.g. "#3b82f6"
  headerBg: string;         // hex, e.g. "#0f172a"
  headerText: string;       // hex, e.g. "#f8fafc"
  bodyText: string;         // hex, e.g. "#111827"
  fontFamily: "sans" | "serif" | "mono";
  fontSize: "small" | "medium" | "large";
  pageMargin: "compact" | "normal" | "spacious";
}

export const DEFAULT_THEME_OPTIONS: TemplateThemeOptions = {
  accentColor: "#3b82f6",
  headerBg: "#0f172a",
  headerText: "#f8fafc",
  bodyText: "#111827",
  fontFamily: "sans",
  fontSize: "medium",
  pageMargin: "normal",
};

export const FONT_SIZE_MAP = { small: "10px", medium: "12px", large: "14px" } as const;
export const PAGE_MARGIN_MAP = { compact: "24px", normal: "40px", spacious: "56px" } as const;
export const FONT_FAMILY_MAP = {
  sans:  "ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono:  "ui-monospace, 'Courier New', monospace",
} as const;

// ─── Section ──────────────────────────────────────────────────────────────────

export interface ReportTemplateSection {
  id: string;
  title: string;
  order: number;
  enabled: boolean;
  content: string;                   // supports {{token}} placeholders
  placeholders: string[];
  conditionalRules?: ConditionalRule[]; // optional logic rules for this section
}

// ─── Template ─────────────────────────────────────────────────────────────────
export type ReportTemplateExamType = "abdomen" | "thyroid" | "ob" | "vascular" | "general";
export type ReportTemplateType = "premade" | "custom";
export type TemplateTier = "individual" | "professional" | "enterprise";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  examType: ReportTemplateExamType;
  templateType: ReportTemplateType;
  tierAvailability: TemplateTier;
  supportsLogo: boolean;
  includesSonolynxBranding: boolean;
  layoutStyle: ReportTemplateLayoutStyle;
  themeOptions: TemplateThemeOptions;
  sections: ReportTemplateSection[];
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Branding ─────────────────────────────────────────────────────────────────
export interface ReportBrandingSettings {
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  hospitalEmail: string;
  hospitalWebsite: string;
  logoUrl: string;
  showSonolynxBranding: boolean;
  footerText: string;
}

// ─── Placeholder Tokens ───────────────────────────────────────────────────────
export const PLACEHOLDER_GROUPS = {
  "Hospital": [
    "{{hospitalName}}",
    "{{hospitalAddress}}",
    "{{hospitalPhone}}",
    "{{hospitalEmail}}",
    "{{hospitalWebsite}}",
    "{{hospitalLogo}}",
  ],
  "Patient": [
    "{{patientName}}",
    "{{patientAge}}",
    "{{patientGender}}",
    "{{mrn}}",
  ],
  "Study": [
    "{{accession}}",
    "{{examType}}",
    "{{studyDate}}",
    "{{referringPhysician}}",
  ],
  "Report": [
    "{{findings}}",
    "{{impression}}",
    "{{worksheetSummary}}",
    "{{signedBy}}",
    "{{signedAt}}",
  ],
  "System": [
    "{{sonuLabsBranding}}",
  ],
} as const;

export const REPORT_TEMPLATE_PLACEHOLDERS = Object.values(PLACEHOLDER_GROUPS).flat() as readonly string[];

// Conditional logic fields (for the Rule Builder)
export const CONDITIONAL_LOGIC_FIELDS = [
  { key: "thyroid_nodule_size",    label: "Thyroid Nodule Size (mm)" },
  { key: "liver_size_cm",          label: "Liver Size (cm)" },
  { key: "kidney_left_size",       label: "Left Kidney Size (cm)" },
  { key: "kidney_right_size",      label: "Right Kidney Size (cm)" },
  { key: "cbd_diameter",           label: "CBD Diameter (mm)" },
  { key: "spleen_size",            label: "Spleen Size (cm)" },
  { key: "gestational_age_weeks",  label: "Gestational Age (weeks)" },
  { key: "fetal_biometry_bpd",     label: "Fetal BPD (mm)" },
  { key: "psa_level",              label: "PSA Level" },
  { key: "resistive_index",        label: "Resistive Index" },
] as const;
