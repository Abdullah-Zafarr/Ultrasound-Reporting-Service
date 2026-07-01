import type { ReportTemplate, ReportTemplateExamType } from "@/lib/report-template-types";
import { TIER_CONFIG, type OrganizationTier } from "@/lib/org-scope";

export function getAvailableTemplatesForTier(
  tier: OrganizationTier, 
  examType: ReportTemplateExamType,
  allTemplates: ReportTemplate[]
): ReportTemplate[] {
  const config = TIER_CONFIG[tier];
  
  // Filter by exam type first
  const filteredByExam = allTemplates.filter(
    (item) => item.examType === "general" || item.examType === examType
  );

  // Filter by allowed IDs in Tier Config
  if (config.allowedTemplateIds === "all") {
    return filteredByExam;
  }

  return filteredByExam.filter((item) => 
    config.allowedTemplateIds.includes(item.id)
  );
}

export function shouldShowSonolynxBranding(
  tier: OrganizationTier,
  brandingSettings: { showSonolynxBranding?: boolean } | null | undefined,
): boolean {
  if (tier === "individual") return true;
  return brandingSettings?.showSonolynxBranding ?? (tier === "professional");
}

export function getDevelopmentTier(): OrganizationTier {
  return "enterprise";
}
