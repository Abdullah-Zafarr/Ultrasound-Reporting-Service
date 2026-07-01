from __future__ import annotations

from datetime import datetime
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape


def p(text: str) -> str:
    safe = escape(text)
    return (
        "<w:p><w:r><w:t xml:space=\"preserve\">"
        + safe
        + "</w:t></w:r></w:p>"
    )


def build_document_xml(lines: list[str]) -> str:
    body = "".join(p(line) for line in lines)
    sect = (
        "<w:sectPr>"
        "<w:pgSz w:w=\"12240\" w:h=\"15840\"/>"
        "<w:pgMar w:top=\"1440\" w:right=\"1440\" w:bottom=\"1440\" w:left=\"1440\" "
        "w:header=\"708\" w:footer=\"708\" w:gutter=\"0\"/>"
        "</w:sectPr>"
    )
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        "<w:document xmlns:wpc=\"http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas\" "
        "xmlns:mc=\"http://schemas.openxmlformats.org/markup-compatibility/2006\" "
        "xmlns:o=\"urn:schemas-microsoft-com:office:office\" "
        "xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" "
        "xmlns:m=\"http://schemas.openxmlformats.org/officeDocument/2006/math\" "
        "xmlns:v=\"urn:schemas-microsoft-com:vml\" "
        "xmlns:wp14=\"http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing\" "
        "xmlns:wp=\"http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing\" "
        "xmlns:w10=\"urn:schemas-microsoft-com:office:word\" "
        "xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" "
        "xmlns:w14=\"http://schemas.microsoft.com/office/word/2010/wordml\" "
        "xmlns:w15=\"http://schemas.microsoft.com/office/word/2012/wordml\" "
        "xmlns:wpg=\"http://schemas.microsoft.com/office/word/2010/wordprocessingGroup\" "
        "xmlns:wpi=\"http://schemas.microsoft.com/office/word/2010/wordprocessingInk\" "
        "xmlns:wne=\"http://schemas.microsoft.com/office/word/2006/wordml\" "
        "xmlns:wps=\"http://schemas.microsoft.com/office/word/2010/wordprocessingShape\" "
        "mc:Ignorable=\"w14 w15 wp14\">"
        "<w:body>"
        + body
        + sect
        + "</w:body></w:document>"
    )


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out_file = root / "SOFTWARE_CHANGELOG_2026-05-06.docx"

    lines = [
        "SonuLab React/Nextjs - Software Change Log",
        f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "1) Repository and environment setup",
        "- Cloned repository and installed dependencies.",
        "- Resolved local PowerShell npm wrapper issue by using npm.cmd commands.",
        "- Started and verified local dev server on http://localhost:3000.",
        "",
        "2) Authentication and data access checks",
        "- Verified login is Supabase email/password based (no hardcoded password in UI code).",
        "- Queried configured Supabase project with anon key and confirmed key tables were empty in visible scope.",
        "- Confirmed no seeded default auth user credentials were present in migrations.",
        "",
        "3) Worksheet expansion for sonographer-required options",
        "- Expanded Abdomen worksheet model and UI fields:",
        "  Liver: surface contour; Kidneys: cortical echogenicity + stones; Spleen: echotexture;",
        "  Pancreas: visualization/echotexture/duct; Vessels: portal vein, aorta, IVC; Ascites grading.",
        "- Expanded Thyroid worksheet model and UI fields:",
        "  Gland parenchyma, vascularity, cervical nodes;",
        "  Nodule descriptors: echogenicity, shape, margin, echogenic foci, TI-RADS retained.",
        "",
        "4) Findings and impression rule updates",
        "- Reworked findings engine to include new abdomen and thyroid fields.",
        "- Added threshold-driven logic for key measurements and abnormality conditions.",
        "- Added recommendations section support to report output for structured follow-up guidance.",
        "",
        "5) Validation and safety controls",
        "- Added validation issue model (error/warning) with worksheet validators for abdomen and thyroid.",
        "- Added sign-off guardrails in app workflow: blocking transmission when critical errors exist.",
        "- Added quality warnings in preview when completeness/quality concerns are detected.",
        "- Added TI-RADS size/category recommendation logic (TR3/TR4/TR5 follow-up/FNA thresholds).",
        "",
        "6) Randomized consistency testing",
        "- Implemented randomized test harness for findings/rule consistency.",
        "- Ran 5000 randomized cases (2500 abdomen + 2500 thyroid) and iterated test matching logic.",
        "- Final randomized rule-consistency run passed with zero failures.",
        "",
        "7) Structured hospital-style report generation",
        "- Added Generate Report workflow to produce a structured clinical report with:",
        "  patient details, exam details, indication, technique, key measurements, findings, impression,",
        "  recommendations, and additional notes.",
        "- Added formatted report dialog and raw-text tab for usability and copy workflows.",
        "",
        "8) Mock patient and case generation for findings testing",
        "- Added seeded random mock patients with random demographics and exam assignment.",
        "- Added per-patient random worksheet case data for abdomen/thyroid.",
        "- Updated patient selection flow to auto-load corresponding random case and notes.",
        "",
        "9) Documentation updates created",
        "- WORKSHEET_CHANGES.md",
        "- FDA_ACCURACY_READINESS.md",
        "",
        "10) Build/verification status",
        "- Project builds successfully after major feature updates.",
        "- Lint command in this repo remains misconfigured under current setup.",
        "",
        "Files updated in this work cycle:",
        "- app/page.tsx",
        "- src/lib/sonoflow-types.ts",
        "- src/lib/report-engine.ts",
        "- src/lib/smart-parser.ts",
        "- src/components/sonoflow/ClinicalWorksheet.tsx",
        "- src/components/sonoflow/ThyroidWorksheet.tsx",
        "- src/components/sonoflow/ReportPreview.tsx",
        "- src/components/sonoflow/StructuredReportDialog.tsx",
        "- scripts/random-findings-validation.ts",
        "- scripts/generate_changelog_docx.py",
        "- WORKSHEET_CHANGES.md",
        "- FDA_ACCURACY_READINESS.md",
        "",
        "Generated by Codex.",
    ]

    document_xml = build_document_xml(lines)

    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"""

    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    with ZipFile(out_file, "w", ZIP_DEFLATED) as zf:
      zf.writestr("[Content_Types].xml", content_types)
      zf.writestr("_rels/.rels", rels)
      zf.writestr("word/document.xml", document_xml)

    print(str(out_file))


if __name__ == "__main__":
    main()
