import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Save, Trash2, Info } from "lucide-react";

interface TemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
}

const SMART_TAGS = [
  { tag: "[Findings]", desc: "All anatomical findings" },
  { tag: "[Impression]", desc: "Numbered list of impressions" },
  { tag: "[Findings_Bullets]", desc: "Findings as a bulleted list" },
  { tag: "[Findings_Brief]", desc: "Findings excluding 'Normal' entries" },
  { tag: "[Impression_Bullets]", desc: "Impressions as a bulleted list" },
  { tag: "[Recommendations]", desc: "Clinical recommendations" },
  { tag: "[Measurements_List]", desc: "Key organ measurements" },
  { tag: "[Exam_Type]", desc: "Name of the exam (e.g. THYROID)" },
  { tag: "[Notes]", desc: "Additional clinician notes" },
];

export function TemplateEditor({ open, onOpenChange, category }: TemplateEditorProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !content) {
      toast.error("Missing fields", { description: "Please provide a name and template content." });
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any).from("report_templates").insert({
        name,
        description,
        category,
        content_structure: content,
        created_by: user.id,
        is_system: false,
      });

      if (error) throw error;

      toast.success("Template created", { description: `'${name}' is now available in your list.` });
      setName("");
      setDescription("");
      setContent("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Save failed", { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const insertTag = (tag: string) => {
    setContent((prev) => prev + tag);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Custom Report Template</DialogTitle>
          <DialogDescription>
            Design a custom format for {category} reports using Smart Tags.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Concise Abdomen"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="desc" className="text-right">Description</Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="col-span-3"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Template Content</Label>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Info className="h-3 w-3" />
                Click a tag to insert it
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 rounded-md border bg-muted/30 p-2">
              {SMART_TAGS.map((t) => (
                <Badge
                  key={t.tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => insertTag(t.tag)}
                  title={t.desc}
                >
                  {t.tag}
                </Badge>
              ))}
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your template here... e.g.\n\nSUMMARY:\n[Impression]\n\nDETAIL:\n[Findings]"
              className="h-[250px] font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}
