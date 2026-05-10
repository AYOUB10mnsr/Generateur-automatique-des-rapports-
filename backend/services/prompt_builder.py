from __future__ import annotations

from services.language_utils import DEFAULT_REPORT_LANGUAGE


def build_language_instruction(language: str) -> str:
    prompts = {
        "fr": "Génère un rapport professionnel et structuré de cette réunion en français.",
        "en": "Generate a professional and structured meeting report in English.",
        "ar": "قم بإنشاء تقرير اجتماع احترافي ومنظم باللغة العربية.",
    }
    return prompts.get(language, prompts[DEFAULT_REPORT_LANGUAGE])


def build_system_prompt(language: str) -> str:
    return (
        "You are a senior meeting analyst and executive communications specialist. "
        "Your task is to transform noisy meeting transcripts into precise, decision-grade summaries.\n\n"
        f"{build_language_instruction(language)}\n\n"
        "Requirements:\n"
        "- Produce exactly 4 sections in this exact order and numbering.\n"
        "- Section titles, summary, decisions, and action items must be in the requested report language.\n"
        "- Keep speaker names exactly as they appear in the transcript; never translate names.\n"
        "- Use concise, factual, professional language.\n"
        "- Infer the meeting objective and scope when not explicit, but do not invent facts.\n"
        "- Resolve pronouns when possible using speaker cues.\n"
        "- Deduplicate repeated points.\n"
        "- Prioritize outcomes, tradeoffs, commitments, and risks.\n"
        "- For Decisions: include only explicit decisions or high-confidence implied decisions.\n"
        "- For Action items: use bullet points with owner + task + due date/status when present. "
        "If owner/date are missing, mark as unspecified in the report language.\n"
        "- If no reliable content for a section, write an equivalent of 'None identified.' in the report language.\n"
        "- Do not output JSON. Do not include preamble or commentary outside the 4 sections."
    )


def build_user_prompt(transcript: str, language: str) -> str:
    section_templates = {
        "fr": (
            "1. Contexte\n"
            "<2-5 phrases ou points concis>\n\n"
            "2. Points clés\n"
            "- ...\n"
            "- ...\n\n"
            "3. Décisions\n"
            "- ...\n"
            "- ...\n\n"
            "4. Actions\n"
            "- Responsable: <nom ou Non spécifié> | Tâche: <tâche> | Échéance: <date ou Non spécifiée>\n\n"
        ),
        "en": (
            "1. Context\n"
            "<2-5 sentences or concise bullets>\n\n"
            "2. Key points\n"
            "- ...\n"
            "- ...\n\n"
            "3. Decisions\n"
            "- ...\n"
            "- ...\n\n"
            "4. Action items\n"
            "- Owner: <name or Unspecified> | Task: <task> | Due: <date or Unspecified>\n\n"
        ),
        "ar": (
            "1. السياق\n"
            "<2-5 جمل أو نقاط موجزة>\n\n"
            "2. النقاط الرئيسية\n"
            "- ...\n"
            "- ...\n\n"
            "3. القرارات\n"
            "- ...\n"
            "- ...\n\n"
            "4. عناصر العمل\n"
            "- المسؤول: <الاسم أو غير محدد> | المهمة: <المهمة> | الموعد: <التاريخ أو غير محدد>\n\n"
        ),
    }
    template = section_templates.get(language, section_templates[DEFAULT_REPORT_LANGUAGE])
    return (
        "Create a structured meeting summary from the following transcript.\n\n"
        "Output template (follow strictly):\n"
        f"{template}"
        "Transcript:\n"
        f"{transcript.strip()}"
    )
