"use client";

import { Button } from "@/components/ui/button";
import { Printer, Download, Loader2 } from "lucide-react";
import { printElementById } from "@/lib/report-print-utils";
import { downloadElementAsPdf } from "@/lib/pdf-export";
import { useState } from "react";

interface Props {
  targetId: string;
}

export function ReportDownloadButton({ targetId }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadElementAsPdf(targetId, `Report-${new Date().getTime()}`);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => printElementById(targetId)}
        className="h-9"
      >
        <Printer className="mr-1.5 h-3.5 w-3.5" />
        Print PDF
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDownload}
        disabled={downloading}
        className="h-9 bg-background"
      >
        {downloading ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" />
        )}
        Download PDF
      </Button>
    </div>
  );
}
