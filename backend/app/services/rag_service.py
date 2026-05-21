from __future__ import annotations

import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ai_provider import AIProviderManager
from app.core.logging import get_logger
from database.db import SessionLocal
from database.models import Report, Segment, Speaker

try:
    import chromadb
except Exception:  # noqa: BLE001
    chromadb = None

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # noqa: BLE001
    SentenceTransformer = None

logger = get_logger(__name__)

NO_RELEVANT_INFORMATION = "Information non disponible dans cette réunion."


@dataclass(frozen=True)
class RAGQueryResult:
    answer: str


class RAGService:
    def __init__(self) -> None:
        if chromadb is None or SentenceTransformer is None:
            raise RuntimeError("RAG dependencies are missing. Install chromadb and sentence-transformers.")
        self._embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
        self._collection_name = "meeting_chunks"
        self._db_dir = (Path(__file__).resolve().parents[2] / "chroma_db").resolve()
        self._db_dir.mkdir(parents=True, exist_ok=True)
        self._default_top_k = 8

        self._chroma_client = chromadb.PersistentClient(path=str(self._db_dir))
        self._collection = self._chroma_client.get_or_create_collection(name=self._collection_name)
        self._embedder = SentenceTransformer(self._embedding_model_name)
        self._provider_manager = AIProviderManager()

    def index_report(self, report_id: int, transcription: str, summary: str, segments: list[dict[str, Any]]) -> None:
        docs: list[str] = []
        ids: list[str] = []
        metadatas: list[dict[str, Any]] = []

        for chunk in self._build_segment_chunks(segments):
            text = str(chunk.get("text", "")).strip()
            if not text:
                continue
            docs.append(text)
            ids.append(f"report-{report_id}-{uuid.uuid4().hex}")
            metadatas.append(
                {
                    "report_id": int(report_id),
                    "speaker": str(chunk.get("speaker", "Unknown")),
                    "timestamp": str(chunk.get("timestamp", "N/A")),
                    "content_type": "segment",
                }
            )

        summary_text = (summary or "").strip()
        if summary_text:
            docs.append(summary_text)
            ids.append(f"report-{report_id}-summary-{uuid.uuid4().hex}")
            metadatas.append(
                {
                    "report_id": int(report_id),
                    "speaker": "SYSTEM_SUMMARY",
                    "timestamp": "N/A",
                    "content_type": "summary",
                }
            )

        decision_chunks = self._extract_decision_chunks(segments)
        for decision_text in decision_chunks:
            docs.append(decision_text)
            ids.append(f"report-{report_id}-decision-{uuid.uuid4().hex}")
            metadatas.append(
                {
                    "report_id": int(report_id),
                    "speaker": "SYSTEM_DECISION",
                    "timestamp": "N/A",
                    "content_type": "decision",
                }
            )

        transcription_text = (transcription or "").strip()
        if transcription_text:
            for i, part in enumerate(self._split_text(transcription_text, max_chars=900)):
                docs.append(part)
                ids.append(f"report-{report_id}-transcription-{i}-{uuid.uuid4().hex}")
                metadatas.append(
                    {
                        "report_id": int(report_id),
                        "speaker": "TRANSCRIPTION",
                        "timestamp": "N/A",
                        "content_type": "transcription",
                    }
                )

        if not docs:
            return

        embeddings = self._embedder.encode(docs, normalize_embeddings=True).tolist()
        self._collection.add(ids=ids, documents=docs, metadatas=metadatas, embeddings=embeddings)
        logger.info("[RAG] Indexed report_id=%s chunks=%s", report_id, len(docs))

    def query(
        self,
        question: str,
        top_k: int = 8,
        report_id: int | None = None,
        speaker: str | None = None,
        conversation_history: list[dict[str, str]] | None = None,
    ) -> RAGQueryResult:
        clean_question = (question or "").strip()
        if not clean_question:
            return RAGQueryResult(answer=NO_RELEVANT_INFORMATION)

        print("[RAG] Query:", clean_question)
        self._ensure_index()

        if self._is_global_question(clean_question):
            sql_context = self._build_global_sql_context(clean_question)
            answer = self._ask_llm(clean_question, sql_context, is_global=True, conversation_history=conversation_history)
            return RAGQueryResult(answer=answer)

        if report_id is None:
            return RAGQueryResult(answer=NO_RELEVANT_INFORMATION)

        final_top_k = max(1, int(top_k or self._default_top_k))
        rag_context = self._build_rag_context(clean_question, report_id, final_top_k, speaker)
        if not rag_context["chunks"]:
            fallback_context = self._build_transcription_fallback_context(report_id=report_id, question=clean_question)
            if fallback_context:
                rag_context["chunks"].extend(fallback_context)

        if not rag_context["chunks"]:
            return RAGQueryResult(answer=NO_RELEVANT_INFORMATION)

        meeting_context = self._build_report_context(report_id)
        full_context = self._compose_full_context(meeting_context=meeting_context, chunk_rows=rag_context["chunks"])
        answer = self._ask_llm(clean_question, full_context, is_global=False, conversation_history=conversation_history)
        return RAGQueryResult(answer=answer)

    def get_debug_snapshot(self, report_id: int, question: str | None = None, top_k: int = 8) -> dict[str, Any]:
        self._ensure_index()
        rows: list[dict[str, Any]] = []
        scores: list[float] = []
        query_text = (question or "résumé de la réunion").strip()
        retrieval = self._build_rag_context(query_text, report_id, max(1, top_k))
        rows = retrieval["chunks"]
        scores = [r.get("score", 0.0) for r in rows]

        return {
            "report_id": report_id,
            "query": query_text,
            "index_state": "ready",
            "collection_name": self._collection_name,
            "embeddings_count": self._collection.count(),
            "chunks_count_for_report": self._count_chunks_for_report(report_id),
            "top_k": top_k,
            "similarity_scores": scores,
            "top_chunks": rows,
        }

    def _build_rag_context(self, question: str, report_id: int, top_k: int, speaker: str | None = None) -> dict[str, Any]:
        where: dict[str, Any] = {"report_id": int(report_id)}
        if speaker:
            where = {"$and": [{"report_id": int(report_id)}, {"speaker": str(speaker)}]}

        query_embedding = self._embedder.encode([question], normalize_embeddings=True).tolist()
        if not query_embedding or not query_embedding[0]:
            return {"chunks": []}

        result = self._collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        documents = (result.get("documents") or [[]])[0]
        metadatas = (result.get("metadatas") or [[]])[0]
        distances = (result.get("distances") or [[]])[0]

        chunks: list[dict[str, Any]] = []
        for idx, text in enumerate(documents):
            if not text:
                continue
            metadata = metadatas[idx] if idx < len(metadatas) else {}
            distance = float(distances[idx]) if idx < len(distances) else 1.0
            score = max(0.0, 1.0 - distance)
            chunks.append(
                {
                    "text": str(text),
                    "speaker": str(metadata.get("speaker", "Unknown")),
                    "timestamp": str(metadata.get("timestamp", "N/A")),
                    "content_type": str(metadata.get("content_type", "segment")),
                    "score": round(score, 4),
                }
            )

        print("[RAG] Retrieved chunks:", [c["text"][:180] for c in chunks])
        print("[RAG] Similarity scores:", [c["score"] for c in chunks])
        return {"chunks": chunks}

    def _build_transcription_fallback_context(self, report_id: int, question: str) -> list[dict[str, Any]]:
        db = SessionLocal()
        try:
            report = db.query(Report).filter(Report.id == report_id).first()
            if report is None or not (report.transcription or "").strip():
                return []
            pieces = self._split_text(report.transcription, max_chars=1000)
            if not pieces:
                return []
            query_embedding = self._embedder.encode([question], normalize_embeddings=True)[0]
            piece_embeddings = self._embedder.encode(pieces, normalize_embeddings=True)
            scored = []
            for i, emb in enumerate(piece_embeddings):
                score = float((query_embedding * emb).sum())
                scored.append((score, pieces[i]))
            scored.sort(key=lambda x: x[0], reverse=True)
            selected = scored[:2]
            return [
                {
                    "text": text,
                    "speaker": "TRANSCRIPTION",
                    "timestamp": "N/A",
                    "content_type": "transcription_fallback",
                    "score": round(float(score), 4),
                }
                for score, text in selected
            ]
        finally:
            db.close()

    def _compose_full_context(self, meeting_context: str, chunk_rows: list[dict[str, Any]]) -> str:
        excerpts = []
        for chunk in chunk_rows:
            excerpts.append(
                f"[type={chunk['content_type']} speaker={chunk['speaker']} time={chunk['timestamp']}] {chunk['text']}"
            )
        return (
            f"{meeting_context}\n\n"
            "Extraits pertinents retrouvés:\n"
            f"{chr(10).join(excerpts)}"
        )

    def _ask_llm(
        self,
        question: str,
        system_context: str,
        is_global: bool,
        conversation_history: list[dict[str, str]] | None = None,
    ) -> str:
        scope = (
            "Vous répondez sur des statistiques globales du système."
            if is_global
            else "Vous répondez sur la réunion sélectionnée."
        )
        history_text = ""
        if conversation_history:
            lines = []
            for m in conversation_history[-5:]:
                role = str(m.get("role", "user"))
                content = str(m.get("content", "")).strip()
                if content:
                    lines.append(f"{role}: {content}")
            if lines:
                history_text = "Historique récent:\n" + "\n".join(lines) + "\n\n"

        prompt = (
            "Tu es un assistant IA spécialisé dans l’analyse de réunions professionnelles.\n"
            f"{scope}\n"
            "Réponds de manière naturelle, concise et utile.\n"
            "Utilise: transcription, speakers, décisions, résumé et contexte réunion.\n"
            "Si l’information est partielle, réponds avec ce qui est disponible.\n"
            f"Ne réponds \"{NO_RELEVANT_INFORMATION}\" que si aucune donnée exploitable n’existe.\n"
            "N'utilise pas de markdown et ne mentionne pas RAG, chunks, scores ou métadonnées.\n\n"
            f"{history_text}Contexte:\n{system_context}\n\n"
            f"Question:\n{question}\n"
        )
        try:
            llm_result = self._provider_manager.generate(prompt)
            answer = (llm_result.text or "").strip()
            return answer or NO_RELEVANT_INFORMATION
        except Exception as exc:  # noqa: BLE001
            logger.error("[RAG] generation failed: %s", exc)
            return NO_RELEVANT_INFORMATION

    def _build_report_context(self, report_id: int) -> str:
        db = SessionLocal()
        try:
            report = db.query(Report).filter(Report.id == report_id).first()
            if report is None:
                return ""
            segments = db.query(Segment).filter(Segment.report_id == report_id).order_by(Segment.start.asc()).all()
            speakers = sorted({(s.speaker_name or "Unknown").strip() or "Unknown" for s in segments})
            duration = 0.0
            if segments:
                duration = max(float(segments[-1].end), 0.0) - min(float(segments[0].start), 0.0)
            short_summary = (report.summary or "").strip().replace("\n", " ")
            if len(short_summary) > 350:
                short_summary = f"{short_summary[:347]}..."
            subjects = self._extract_subjects(short_summary, report.transcription or "")
            return (
                "Vous analysez une réunion professionnelle.\n"
                f"Description du rapport: {short_summary or 'Non spécifiée'}\n"
                f"Langue: {report.report_language or 'unknown'}\n"
                f"Date: {report.created_at.isoformat() if report.created_at else 'unknown'}\n"
                f"Durée: {max(duration, 0.0):.1f} secondes\n"
                f"Speakers détectés: {', '.join(speakers) if speakers else 'Aucun'}\n"
                f"Nombre de segments: {len(segments)}\n"
                f"Sujets principaux: {subjects}\n"
                f"Résumé automatique: {short_summary or 'Non disponible'}"
            )
        finally:
            db.close()

    def _build_global_sql_context(self, question: str) -> str:
        db = SessionLocal()
        try:
            total_reports = db.query(Report).count()
            total_speakers = db.query(Speaker).count()
            total_segments = db.query(Segment).count()
            latest = db.query(Report).order_by(Report.created_at.desc()).first()
            rows = db.query(Segment.speaker_name).all()
            by_speaker: dict[str, int] = {}
            for (name,) in rows:
                clean = (name or "Unknown").strip() or "Unknown"
                by_speaker[clean] = by_speaker.get(clean, 0) + 1
            top_speaker = "Aucun"
            top_count = 0
            if by_speaker:
                top_speaker, top_count = max(by_speaker.items(), key=lambda x: x[1])
            recent_report_ids = [str(rid) for (rid,) in db.query(Report.id).order_by(Report.created_at.desc()).limit(30).all()]
            return (
                "Contexte SQL global système:\n"
                f"Question: {question}\n"
                f"Nombre total de réunions: {total_reports}\n"
                f"Nombre total de speakers: {total_speakers}\n"
                f"Nombre total d'interventions: {total_segments}\n"
                f"Speaker le plus fréquent: {top_speaker} ({top_count} interventions)\n"
                f"Rapports existants récents: {', '.join(recent_report_ids) if recent_report_ids else 'Aucun'}\n"
                f"Dernier rapport: id={latest.id if latest else 'Aucun'}, date={latest.created_at.isoformat() if latest and latest.created_at else 'unknown'}"
            )
        finally:
            db.close()

    @staticmethod
    def _extract_decision_chunks(segments: list[dict[str, Any]]) -> list[str]:
        markers = [
            "décidé",
            "decide",
            "decision",
            "action",
            "approuvé",
            "valider",
            "prochaine étape",
            "next step",
            "todo",
        ]
        chunks = []
        for seg in segments or []:
            text = str(seg.get("text", "")).strip()
            if not text:
                continue
            low = text.lower()
            if any(m in low for m in markers):
                speaker = str(seg.get("speaker", "Unknown"))
                chunks.append(f"{speaker}: {text}")
        return chunks[:30]

    @staticmethod
    def _extract_subjects(summary: str, transcription: str) -> str:
        text = f"{summary} {transcription[:900]}".lower()
        topics = []
        keywords = {
            "budget": "budget",
            "logistique": "logistique",
            "planning": "planning",
            "deadline": "deadline",
            "client": "client",
            "transport": "transport",
            "équipe": "équipe",
            "team": "team",
            "finance": "finance",
        }
        for key, value in keywords.items():
            if key in text:
                topics.append(value)
        return ", ".join(topics[:6]) if topics else "Non déterminés"

    @staticmethod
    def _is_global_question(question: str) -> bool:
        q = (question or "").lower()
        markers = [
            "combien de speakers",
            "nombre de speakers",
            "speaker apparaît le plus",
            "speaker apparait le plus",
            "combien de réunions",
            "combien de reunions",
            "nombre de réunions",
            "nombre de reunions",
            "quels rapports existent",
            "dernier rapport",
            "latest report",
            "global",
            "système",
            "system",
            "base sql",
            "dans le système",
            "dans le systeme",
        ]
        return any(m in q for m in markers)

    @staticmethod
    def _build_segment_chunks(segments: list[dict[str, Any]], max_chars: int = 650) -> list[dict[str, str]]:
        chunks: list[dict[str, str]] = []
        current_text = ""
        current_speaker = "Unknown"
        chunk_start = 0.0
        chunk_end = 0.0

        for seg in segments or []:
            text = str(seg.get("text", "")).strip()
            if not text:
                continue
            speaker = str(seg.get("speaker", "Unknown"))
            start = float(seg.get("start", 0.0))
            end = float(seg.get("end", 0.0))
            same_speaker = speaker == current_speaker
            projected = f"{current_text} {text}".strip()

            if current_text and (len(projected) > max_chars or not same_speaker):
                chunks.append(
                    {
                        "speaker": current_speaker,
                        "timestamp": f"{chunk_start:.2f}-{chunk_end:.2f}",
                        "text": current_text.strip(),
                    }
                )
                current_text = text
                current_speaker = speaker
                chunk_start = start
                chunk_end = end
                continue

            if not current_text:
                current_speaker = speaker
                chunk_start = start
            current_text = projected
            chunk_end = end

        if current_text.strip():
            chunks.append(
                {
                    "speaker": current_speaker,
                    "timestamp": f"{chunk_start:.2f}-{chunk_end:.2f}",
                    "text": current_text.strip(),
                }
            )
        return chunks

    @staticmethod
    def _split_text(text: str, max_chars: int = 900) -> list[str]:
        clean = (text or "").strip()
        if not clean:
            return []
        words = clean.split()
        parts: list[str] = []
        buf = []
        current_len = 0
        for word in words:
            if current_len + len(word) + 1 > max_chars and buf:
                parts.append(" ".join(buf))
                buf = [word]
                current_len = len(word)
            else:
                buf.append(word)
                current_len += len(word) + 1
        if buf:
            parts.append(" ".join(buf))
        return parts

    def _ensure_index(self) -> None:
        try:
            if self._collection.count() == 0:
                self._backfill_from_sqlite()
        except Exception as exc:  # noqa: BLE001
            logger.warning("[RAG] index check/backfill failed: %s", exc)

    def _count_chunks_for_report(self, report_id: int) -> int:
        try:
            rows = self._collection.get(where={"report_id": int(report_id)}, include=[])
            ids = rows.get("ids") or []
            return len(ids)
        except Exception:
            return 0

    def _backfill_from_sqlite(self) -> None:
        db = SessionLocal()
        try:
            reports = db.query(Report).filter(Report.status == "completed").order_by(Report.id.asc()).all()
            for report in reports:
                segments = db.query(Segment).filter(Segment.report_id == report.id).order_by(Segment.start.asc()).all()
                segment_rows = [
                    {"speaker": s.speaker_name, "start": float(s.start), "end": float(s.end), "text": s.text}
                    for s in segments
                ]
                self.index_report(
                    report_id=int(report.id),
                    transcription=str(report.transcription or ""),
                    summary=str(report.summary or ""),
                    segments=segment_rows,
                )
        finally:
            db.close()


_rag_service_singleton: RAGService | None = None


def get_rag_service() -> RAGService:
    global _rag_service_singleton
    if _rag_service_singleton is None:
        _rag_service_singleton = RAGService()
    return _rag_service_singleton
