from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Iterable

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def export_pdf(
    summary: str,
    filename: str = "report.pdf",
    date: str | None = None,
    speakers: list[str] | None = None,
) -> str:
    """
    Export a professional meeting report PDF.

    Args:
        summary: Structured summary text (recommended with numbered sections).
        filename: Output PDF path.
        date: Optional display date. Defaults to current date (YYYY-MM-DD).
        speakers: Optional list of speaker names.

    Returns:
        Absolute path to the generated PDF.
    """
    if not summary or not summary.strip():
        raise ValueError("`summary` must be a non-empty string.")
    if not filename or not filename.strip():
        raise ValueError("`filename` must be a non-empty string.")

    output = Path(filename).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    styles = _build_styles()
    report_date = date.strip() if date and date.strip() else datetime.now().strftime("%Y-%m-%d")

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
    story.append(Paragraph("Meeting Report", styles["title"]))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(f"<b>Date:</b> {report_date}", styles["meta"]))

    if speakers:
        cleaned = [s.strip() for s in speakers if s and s.strip()]
        if cleaned:
            story.append(Spacer(1, 2 * mm))
            story.append(Paragraph(f"<b>Speakers:</b> {', '.join(cleaned)}", styles["meta"]))

    story.append(Spacer(1, 5 * mm))
    story.extend(_render_summary(summary, styles))

    try:
        doc.build(story, onFirstPage=_draw_header_footer, onLaterPages=_draw_header_footer)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"Failed to generate PDF '{output}': {exc}") from exc

    return str(output)


def _build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "TitleClean",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#0F172A"),
            spaceAfter=4,
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor("#334155"),
        ),
        "section": ParagraphStyle(
            "Section",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=colors.HexColor("#0B3C5D"),
            spaceBefore=7,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=2,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            leftIndent=12,
            bulletIndent=0,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=1,
        ),
    }


def _render_summary(summary: str, styles: dict[str, ParagraphStyle]) -> list:
    """
    Render structured summary text with section headings and bullets.
    """
    story = []
    current_has_heading = False

    for raw_line in summary.splitlines():
        line = raw_line.strip()
        if not line:
            story.append(Spacer(1, 1.4 * mm))
            continue

        safe = _escape(line)
        if _is_section_heading(line):
            current_has_heading = True
            story.append(Paragraph(safe, styles["section"]))
            continue

        if line.startswith("- "):
            bullet_text = _escape(line[2:].strip())
            story.append(Paragraph(bullet_text, styles["bullet"], bulletText="•"))
            continue

        if line.startswith("* "):
            bullet_text = _escape(line[2:].strip())
            story.append(Paragraph(bullet_text, styles["bullet"], bulletText="•"))
            continue

        if line[:2].isdigit() and line[2:3] == "." and " " in line:
            # Keep inline numbered detail as normal body text.
            story.append(Paragraph(safe, styles["body"]))
            continue

        # If no headings are provided, still render cleanly as body paragraphs.
        if not current_has_heading and not story:
            story.append(Paragraph("Summary", styles["section"]))
        story.append(Paragraph(safe, styles["body"]))

    return story


def _is_section_heading(line: str) -> bool:
    lowered = line.lower()
    expected = [
        "1. context",
        "2. key points",
        "3. decisions",
        "4. action items",
    ]
    return any(lowered.startswith(item) for item in expected)


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


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
