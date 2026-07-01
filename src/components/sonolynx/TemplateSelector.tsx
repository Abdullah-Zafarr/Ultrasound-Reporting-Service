import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Layout, Loader2, Settings2, Plus } from "lucide-react";
import { TemplateEditor } from "./TemplateEditor";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  content_structure: string;
  is_system: boolean;
}

interface TemplateSelectorProps {
  category: string;
  onSelect: (template: ReportTemplate) => void;
  selectedId?: string;
}

export function TemplateSelector({ category, onSelect, selectedId }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);

  const fetchTemplates = useCallback(async () => {
      setLoading(true);
      const { data }: { data: ReportTemplate[] } = await (supabase as any).from("report_templates")
        .select("*")
        .eq("category", category)
        .order("is_system", { ascending: false })
        .order("name", { ascending: true });

      if (data) {
        setTemplates(data);
        // Default to Standard Clinical if nothing selected
        if (!selectedId && data.length > 0) {
          const standard = data.find(t => t.name === "Standard Clinical") || data[0];
          onSelect(standard);
        }
      }
      setLoading(false);
    }, [category, onSelect, selectedId]);
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;

  return (
    <div className="flex items-center gap-2">
      <Layout className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={selectedId} 
        onValueChange={(id) => {
          const t = templates.find(item => item.id === id);
          if (t) onSelect(t);
        }}
      >
        <SelectTrigger className="h-8 w-[200px] text-xs">
          <SelectValue placeholder="Select template..." />
        </SelectTrigger>
        <SelectContent>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id} className="text-xs">
              <div className="flex flex-col">
                <span className="font-medium">{t.name}</span>
                {t.is_system && <span className="text-[10px] text-muted-foreground opacity-70">System Preset</span>}
              </div>
            </SelectItem>
          ))}
          <SelectSeparator />
          <div 
            className="flex cursor-pointer items-center gap-2 p-2 text-[10px] font-medium text-primary hover:bg-muted"
            onClick={(e) => {
              e.preventDefault();
              setEditorOpen(true);
            }}
          >
            <Plus className="h-3 w-3" />
            Create New Template
          </div>
        </SelectContent>
      </Select>
      
      <TemplateEditor 
        open={editorOpen} 
        onOpenChange={(val) => {
          setEditorOpen(val);
          if (!val) fetchTemplates(); // Refresh on close
        }} 
        category={category} 
      />
    </div>
  );
}
