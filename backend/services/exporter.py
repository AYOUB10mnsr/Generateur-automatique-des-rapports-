from __future__ import annotations

from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def export_pdf(
    summary: str,
    filename: str = "report.pdf",
    date: str | None = None,
    speakers: list[str] | None = None,
    report_language: str = "en",
) -> str:
    if not summary or not summary.strip():
        raise ValueError("`summary` must be a non-empty string.")
    if not filename or not filename.strip():
        raise ValueError("`filename` must be a non-empty string.")

    output = Path(filename).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    fonts = _register_fonts(report_language)
    styles = _build_styles(fonts)
    report_date = date.strip() if date and date.strip() else datetime.now().strftime("%Y-%m-%d")
    title_map = {"fr": "Rapport de reunion", "en": "Meeting Report", "ar": "تقرير الاجتماع"}
    date_map = {"fr": "Date", "en": "Date", "ar": "التاريخ"}
    speakers_map = {"fr": "Intervenants", "en": "Speakers", "ar": "المتحدثون"}

    doc = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        leftMargin=22 * mm,
        rightMargin=22 * mm,
        topMargin=20 * mm,
        bottomMargin=18 * mm,
        title="Meeting Report",
        author="AI Meeting Assistant",
    )

    story = []
    story.append(Paragraph(_prepare_text(title_map.get(report_language, title_map["en"]), report_language), styles["title"]))
    story.append(Spacer(1, 4 * mm))
    story.append(
        Paragraph(
            _prepare_text(f"<b>{date_map.get(report_language, 'Date')}:</b> {report_date}", report_language),
            styles["meta"],
        )
    )
    if speakers:
        cleaned = [s.strip() for s in speakers if s and s.strip()]
        if cleaned:
            story.append(Spacer(1, 2 * mm))
            story.append(
                Paragraph(
                    _prepare_text(f"<b>{speakers_map.get(report_language, 'Speakers')}:</b> {', '.join(cleaned)}", report_language),
                    styles["meta"],
                )
            )
    story.append(Spacer(1, 5 * mm))
    story.extend(_render_summary(summary, styles, report_language))

    try:
        doc.build(story, onFirstPage=_draw_header_footer, onLaterPages=_draw_header_footer)
    except Exception as exc:
        raise RuntimeError(f"Failed to generate PDF '{output}': {exc}") from exc
    return str(output)


def _build_styles(fonts: dict[str, str]) -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("TitleClean", parent=base["Title"], fontName=fonts["bold"], fontSize=20, leading=24, textColor=colors.HexColor("#0F172A"), spaceAfter=4),
        "meta": ParagraphStyle("Meta", parent=base["Normal"], fontName=fonts["regular"], fontSize=10.5, leading=14, textColor=colors.HexColor("#334155")),
        "section": ParagraphStyle("Section", parent=base["Heading2"], fontName=fonts["bold"], fontSize=12.5, leading=16, textColor=colors.HexColor("#0B3C5D"), spaceBefore=7, spaceAfter=4),
        "body": ParagraphStyle("Body", parent=base["Normal"], fontName=fonts["regular"], fontSize=10.5, leading=15, textColor=colors.HexColor("#1F2937"), spaceAfter=2),
        "bullet": ParagraphStyle("Bullet", parent=base["Normal"], fontName=fonts["regular"], fontSize=10.5, leading=15, leftIndent=12, bulletIndent=0, textColor=colors.HexColor("#1F2937"), spaceAfter=1),
    }


def _render_summary(summary: str, styles: dict[str, ParagraphStyle], report_language: str) -> list:
    story = []
    current_has_heading = False
    for raw_line in summary.splitlines():
        line = raw_line.strip()
        if not line:
            story.append(Spacer(1, 1.4 * mm))
            continue
        safe = _prepare_text(_escape(line), report_language)
        if _is_section_heading(line):
            current_has_heading = True
            story.append(Paragraph(safe, styles["section"]))
            continue
        if line.startswith("- ") or line.startswith("* "):
            bullet_text = _prepare_text(_escape(line[2:].strip()), report_language)
            story.append(Paragraph(bullet_text, styles["bullet"], bulletText="•"))
            continue
        if line[:2].isdigit() and line[2:3] == "." and " " in line:
            story.append(Paragraph(safe, styles["body"]))
            continue
        if not current_has_heading and not story:
            story.append(Paragraph(_prepare_text("Summary", report_language), styles["section"]))
        story.append(Paragraph(safe, styles["body"]))
    return story


def _is_section_heading(line: str) -> bool:
    lowered = line.lower()
    expected = [
        "1. context", "2. key points", "3. decisions", "4. action items",
        "1. contexte", "2. points clés", "3. décisions", "4. actions",
        "1. السياق", "2. النقاط الرئيسية", "3. القرارات", "4. عناصر العمل",
    ]
    return any(lowered.startswith(item) for item in expected)


def _escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _draw_header_footer(canvas, doc) -> None:
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(colors.HexColor("#CBD5E1"))
    canvas.setLineWidth(0.6)
    canvas.line(doc.leftMargin, height - 16 * mm, width - doc.rightMargin, height - 16 * mm)
    canvas.line(doc.leftMargin, 14 * mm, width - doc.rightMargin, 14 * mm)
    canvas.setFont("Helvetica", 8.5)
    canvas.setFillColor(colors.HexColor("#64748B"))
    canvas.drawString(doc.leftMargin, 9.5 * mm, "Generated by AI Meeting Assistant")
    canvas.drawRightString(width - doc.rightMargin, 9.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


def _register_fonts(report_language: str) -> dict[str, str]:
    if report_language != "ar":
        return {"regular": "Helvetica", "bold": "Helvetica-Bold"}
    for font_path in [Path("C:/Windows/Fonts/arial.ttf"), Path("C:/Windows/Fonts/tahoma.ttf"), Path("C:/Windows/Fonts/segoeui.ttf")]:
        if not font_path.exists():
            continue
        try:
            pdfmetrics.registerFont(TTFont("MeetingUnicode", str(font_path)))
            return {"regular": "MeetingUnicode", "bold": "MeetingUnicode"}
        except Exception:
            continue
    return {"regular": "Helvetica", "bold": "Helvetica-Bold"}


def _prepare_text(text: str, report_language: str) -> str:
    if report_language != "ar":
        return text
    try:
        import arabic_reshaper  # type: ignore
        from bidi.algorithm import get_display  # type: ignore

        return get_display(arabic_reshaper.reshape(text))
    except Exception:
        return text
