from __future__ import annotations

from services.exporter import export_pdf


def build_pdf(summary: str, filename: str, speakers: list[str], report_language: str) -> str:
    return export_pdf(
        summary=summary,
        filename=filename,
        speakers=speakers,
        report_language=report_language,
    )
