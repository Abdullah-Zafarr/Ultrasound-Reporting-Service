"use client";

import type { RenderedTemplateDocument } from "@/lib/report-template-engine";
import type { ReportTemplateLayoutStyle, TemplateThemeOptions } from "@/lib/report-template-types";
import { DEFAULT_THEME_OPTIONS, FONT_SIZE_MAP, PAGE_MARGIN_MAP, FONT_FAMILY_MAP } from "@/lib/report-template-types";

interface Props {
  rendered: RenderedTemplateDocument;
  layoutStyle: ReportTemplateLayoutStyle;
  themeOptions?: TemplateThemeOptions;
}

export function A4TemplatePreview({ rendered, layoutStyle, themeOptions: themeInput }: Props) {
  const theme = { ...DEFAULT_THEME_OPTIONS, ...themeInput };
  const fontSize   = FONT_SIZE_MAP[theme.fontSize];
  const margin     = PAGE_MARGIN_MAP[theme.pageMargin];
  const fontFamily = FONT_FAMILY_MAP[theme.fontFamily];

  return (
    <div className="w-full overflow-auto rounded-xl border bg-muted/20 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">A4 Preview</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary capitalize">
          {layoutStyle}
        </span>
      </div>
      <div
        className="mx-auto shadow-xl"
        style={{ width: "595px", minHeight: "842px", background: "#fff", fontFamily, fontSize, color: theme.bodyText }}
      >
        {layoutStyle === "modernist"  && <ModernistLayout  sections={rendered.sections} theme={theme} margin={margin} />}
        {layoutStyle === "formalist"  && <FormalistLayout  sections={rendered.sections} theme={theme} margin={margin} />}
        {layoutStyle === "academic"   && <AcademicLayout   sections={rendered.sections} theme={theme} margin={margin} />}
        {layoutStyle === "minimalist" && <MinimalistLayout sections={rendered.sections} theme={theme} margin={margin} />}
        {layoutStyle === "executive"  && <ExecutiveLayout  sections={rendered.sections} theme={theme} margin={margin} />}
        {layoutStyle === "standard"   && <StandardLayout   sections={rendered.sections} theme={theme} margin={margin} />}
      </div>
    </div>
  );
}

type Sections = Array<{ title: string; content: string }>;
type LayoutProps = { sections: Sections; theme: TemplateThemeOptions; margin: string };

// ─── Modernist ────────────────────────────────────────────────────────────────
function ModernistLayout({ sections, theme, margin }: LayoutProps) {
  const [header, ...rest] = sections;
  return (
    <div style={{ padding: margin }}>
      <div style={{ borderLeft: `3px solid ${theme.accentColor}`, paddingLeft: "16px", marginBottom: "36px" }}>
        <pre style={{ margin: 0, fontFamily: "inherit", fontSize: "13px", fontWeight: 600, whiteSpace: "pre-wrap", color: theme.headerText !== "#f8fafc" ? theme.headerText : "#1e293b" }}>{header?.content}</pre>
      </div>
      {rest.map((s, i) => (
        <div key={i} style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.accentColor, marginBottom: "8px" }}>{s.title}</div>
          <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{s.content}</pre>
        </div>
      ))}
    </div>
  );
}

// ─── Formalist ────────────────────────────────────────────────────────────────
function FormalistLayout({ sections, theme, margin }: LayoutProps) {
  const [header, ...rest] = sections;
  return (
    <div style={{ padding: margin }}>
      <div style={{ border: `2px solid ${theme.headerBg}`, padding: "2px" }}>
        <div style={{ border: `1px solid ${theme.headerBg}`, padding: "16px", textAlign: "center", background: theme.headerBg, color: theme.headerText }}>
          <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", fontWeight: 600 }}>{header?.content}</pre>
        </div>
      </div>
      <div style={{ height: "1px", background: theme.accentColor, margin: "20px 0" }} />
      {rest.map((s, i) => (
        <div key={i} style={{ marginBottom: "20px" }}>
          <div style={{ fontWeight: 700, fontSize: "11px", textTransform: "uppercase", borderBottom: `1px solid ${theme.accentColor}`, paddingBottom: "4px", marginBottom: "8px", color: theme.accentColor }}>{s.title}</div>
          <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{s.content}</pre>
        </div>
      ))}
    </div>
  );
}

// ─── Academic ─────────────────────────────────────────────────────────────────
function AcademicLayout({ sections, theme, margin }: LayoutProps) {
  const [header, ...rest] = sections;
  const mid = Math.ceil(rest.length / 2);
  return (
    <div style={{ padding: margin }}>
      <div style={{ background: theme.headerBg, color: theme.headerText, borderBottom: `2px solid ${theme.accentColor}`, padding: "12px", marginBottom: "24px" }}>
        <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", fontWeight: 600 }}>{header?.content}</pre>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {[rest.slice(0, mid), rest.slice(mid)].map((col, ci) => (
          <div key={ci}>
            {col.map((s, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", background: theme.accentColor, color: "#fff", padding: "2px 6px", marginBottom: "6px", display: "inline-block" }}>{s.title}</div>
                <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{s.content}</pre>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Minimalist ───────────────────────────────────────────────────────────────
function MinimalistLayout({ sections, theme, margin }: LayoutProps) {
  return (
    <div style={{ padding: margin }}>
      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: i === 0 ? "40px" : "28px" }}>
          <div style={{ fontSize: i === 0 ? "16px" : "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: i === 0 ? "0" : "0.14em", color: i === 0 ? theme.bodyText : theme.accentColor, marginBottom: "8px" }}>{s.title}</div>
          <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: 1.85 }}>{s.content}</pre>
        </div>
      ))}
    </div>
  );
}

// ─── Executive ────────────────────────────────────────────────────────────────
function ExecutiveLayout({ sections, theme, margin }: LayoutProps) {
  const [header, patient, referral, ...rest] = sections;
  return (
    <div>
      <div style={{ background: theme.headerBg, color: theme.headerText, padding: `28px ${margin}` }}>
        <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", fontWeight: 700 }}>{header?.content}</pre>
      </div>
      <div style={{ background: `${theme.headerBg}cc`, color: "#94a3b8", padding: `12px ${margin}`, display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <pre style={{ margin: 0, fontFamily: "inherit", fontSize: "10px", whiteSpace: "pre-wrap" }}>{patient?.content}</pre>
        {referral && <pre style={{ margin: 0, fontFamily: "inherit", fontSize: "10px", whiteSpace: "pre-wrap", borderLeft: `1px solid ${theme.accentColor}`, paddingLeft: "24px" }}>{referral.content}</pre>}
      </div>
      <div style={{ padding: `32px ${margin}` }}>
        {rest.map((s, i) => (
          <div key={i} style={{ marginBottom: "24px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: theme.accentColor, display: "inline-block" }} />
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.accentColor }}>{s.title}</span>
            </div>
            <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{s.content}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Standard ─────────────────────────────────────────────────────────────────
function StandardLayout({ sections, theme, margin }: LayoutProps) {
  return (
    <div style={{ padding: margin }}>
      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: "20px" }}>
          {i > 0 && <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: theme.accentColor, borderBottom: `1px solid ${theme.accentColor}33`, paddingBottom: "4px", marginBottom: "8px" }}>{s.title}</div>}
          <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: 1.7, fontWeight: i === 0 ? 600 : 400 }}>{s.content}</pre>
        </div>
      ))}
    </div>
  );
}
