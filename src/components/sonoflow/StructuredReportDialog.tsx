"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { A4ReportPreview } from "@/components/sonoflow/A4ReportPreview";
import { ReportDownloadButton } from "@/components/sonoflow/ReportDownloadButton";
import type { ReportTemplate } from "@/lib/report-template-types";
import type { RenderedTemplateDocument } from "@/lib/report-template-engine";
import type { ReportBrandingSettings } from "@/lib/report-template-types";
import { shouldShowSonolynxBranding } from "@/lib/template-tier-access";
import type { OrganizationTier } from "@/lib/org-scope";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseReportText: string;
  templates: ReportTemplate[];
  selectedTemplateId: string;
  onTemplateChange: (templateId: string) => void;
  renderedDocument: RenderedTemplateDocument;
  tier: OrganizationTier;
  branding: ReportBrandingSettings;
}

export function StructuredReportDialog({
  open,
  onOpenChange,
  baseReportText,
  templates,
  selectedTemplateId,
  onTemplateChange,
  renderedDocument,
  tier,
  branding,
}: Props) {
  const [copied, setCopied] = useState(false);
  const showSonolynxBranding = shouldShowSonolynxBranding(tier, branding);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(renderedDocument.plainText || baseReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Generated Structured Clinical Report
            <Badge variant="outline" className="ml-1 text-[10px]">A4 Preview</Badge>
          </DialogTitle>
          <DialogDescription>
            Visual template wraps existing generated findings and impression text.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md border bg-muted/20 p-2">
          <select
            value={selectedTemplateId}
            onChange={(event) => onTemplateChange(event.target.value)}
            className="h-9 min-w-64 rounded-md border bg-background px-2 text-sm"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <ReportDownloadButton targetId="a4-print-root" />
          <button className="h-9 rounded-md border bg-background px-3 text-sm" onClick={handleCopy} type="button">
            {copied ? "Copied" : "Copy Text"}
          </button>
        </div>

        <Tabs defaultValue="formatted" className="w-full">
          <TabsList>
            <TabsTrigger value="formatted">A4 Preview</TabsTrigger>
            <TabsTrigger value="raw">Raw Text</TabsTrigger>
          </TabsList>

          <TabsContent value="formatted" className="mt-3">
            <ScrollArea className="h-[70vh] rounded-md border bg-slate-100 p-3">
              <div id="a4-print-root">
                <A4ReportPreview document={renderedDocument} branding={branding} showSonolynxBranding={showSonolynxBranding} />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="mt-3">
            <pre className="max-h-[70vh] overflow-auto rounded-md border bg-white p-4 text-xs leading-relaxed">
              {renderedDocument.plainText || baseReportText}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
