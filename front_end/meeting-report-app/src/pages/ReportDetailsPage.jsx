import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Copy, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { useQueryReport } from "../hooks/useReportDetails";
import { downloadReportPdf, ragQuery } from "../services/api";
import { Button, Card, Input, Page } from "../components/common/ui";
import { downloadBlob, formatDate } from "../utils";

export default function ReportDetailsPage() {
  const { id } = useParams();
  const { report, loading } = useQueryReport(id);
  const [q, setQ] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const filteredSegments = useMemo(() => {
    const segs = report?.segments || [];
    if (!q) return segs;
    return segs.filter((s) => s.text?.toLowerCase().includes(q.toLowerCase()) || s.speaker_name?.toLowerCase().includes(q.toLowerCase()));
  }, [report, q]);

  const copySummary = async () => {
    await navigator.clipboard.writeText(report?.summary || "");
    toast.success("Summary copied");
  };

  const onDownload = async () => {
    if (report?.status !== "completed") {
      toast.error("Le rapport est encore en cours de génération, veuillez patienter.");
      return;
    }
    const blob = await downloadReportPdf(id);
    downloadBlob(blob, `report-${id}.pdf`);
  };

  const onAskAi = async () => {
    if (!aiQuestion.trim()) {
      toast.error("Veuillez saisir une question.");
      return;
    }
    if (!report?.id) {
      toast.error("Rapport introuvable.");
      return;
    }
    try {
      setAiLoading(true);
      const data = await ragQuery({
        question: aiQuestion.trim(),
        report_id: Number(report.id),
      });
      setAiAnswer(data?.answer || "");
    } catch (e) {
      toast.error(e?.message || "Erreur lors de la requête IA");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <Page><Card>Loading report...</Card></Page>;

  return (
    <Page>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl">Meeting Report #{report?.id}</h1>
            <p className="text-sm text-muted">
              {formatDate(report?.created_at)} | Language: {report?.report_language || "en"} | Status: {report?.status || "unknown"} ({report?.step || "-"})
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={copySummary}><Copy size={15} /> Copy Text</Button>
            <Button onClick={onDownload} disabled={report?.status !== "completed"}>
              <Download size={15} /> Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {report?.status === "processing" && (
        <Card>
          <p className="text-sm text-muted">Traitement en cours... ne quittez pas cette page.</p>
          <p className="text-sm text-muted">Étape actuelle: {report?.step || "processing"}</p>
        </Card>
      )}

      {report?.status === "error" && (
        <Card>
          <p className="text-sm text-red-500">Erreur de pipeline: {report?.error_message || "Unknown error"}</p>
        </Card>
      )}

      <Card>
        <h2 className="font-display text-lg">AI Summary</h2>
        <pre className="mt-2 whitespace-pre-wrap text-sm">{report?.summary}</pre>
      </Card>

      <Card>
        <h2 className="font-display text-lg">Chat IA</h2>
        <div className="mt-3 flex gap-2">
          <Input
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Posez une question sur cette réunion..."
          />
          <Button onClick={onAskAi} disabled={aiLoading}>
            {aiLoading ? "Analyse..." : "Envoyer"}
          </Button>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm">
          {aiAnswer || "La réponse IA apparaîtra ici."}
        </p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2"><Search size={15} /><Input placeholder="Search transcript or speaker" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
          {filteredSegments.map((s, i) => (
            <div key={`${s.start}-${i}`} className="rounded-lg border border-app p-3">
              <p className="text-xs text-accent">[{s.speaker_name || s.speaker || "Unknown"}] {Number(s.start || 0).toFixed(1)}s - {Number(s.end || 0).toFixed(1)}s</p>
              <p className="mt-1 text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}
