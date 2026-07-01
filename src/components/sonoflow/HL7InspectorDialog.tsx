import { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hl7: string;
}

export function HL7InspectorDialog({ open, onOpenChange, hl7 }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hl7);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Display segments on separate lines for readability
  const display = hl7.replace(/\r\n/g, "\n");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            Generated HL7 ORU^R01 Message
            <Badge variant="outline" className="ml-1 text-[10px]">v2.3</Badge>
          </DialogTitle>
          <DialogDescription>
            Live preview of the HL7 payload that will be transmitted to the RIS upon signing.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <pre className="max-h-[60vh] overflow-auto rounded-md border border-slate-700 bg-slate-950 p-4 font-mono text-[12px] leading-relaxed text-emerald-300">
            {display}
          </pre>
          <Button
            size="sm"
            variant="secondary"
            className="absolute right-2 top-2 h-7"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="mr-1 h-3 w-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" /> Copy
              </>
            )}
          </Button>
        </div>

        <div className="text-[11px] text-muted-foreground">
          Segments: MSH (header), PID (patient), OBR (order), OBX (observation/report).
        </div>
      </DialogContent>
    </Dialog>
  );
}
