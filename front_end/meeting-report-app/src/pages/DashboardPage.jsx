import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileUp, Link2, Mic, PlayCircle, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { processMeeting } from "../services/api";
import { useSettings } from "../contexts/SettingsContext";
import { useReports } from "../hooks/useReports";
import { Card, Button, Input, Page, Select } from "../components/common/ui";
import { formatDate } from "../utils";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { defaultLanguage } = useSettings();
  const { reports } = useReports();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState(null);
  const [lang, setLang] = useState(defaultLanguage);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => ({
    meetings: reports.length,
    languages: new Set(reports.map((r) => r.report_language).filter(Boolean)).size,
  }), [reports]);

  const submit = async () => {
    if (!file && !youtubeUrl) return toast.error("Add file or YouTube URL first");
    try {
      setBusy(true);
      const result = await processMeeting({ file, youtubeUrl, lang });
      toast.success("Pipeline started");
      navigate("/processing", { state: { result, source: file?.name || youtubeUrl, lang } });
    } catch (e) {
      toast.error(e?.message || "Processing failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="relative overflow-hidden">
          <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 6, repeat: Infinity }} className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,255,146,0.24),transparent_40%)]" />
          <h1 className="font-display text-3xl">Futuristic Meeting Intelligence</h1>
          <p className="mt-2 text-muted">Upload audio/video or paste YouTube link and generate multilingual speaker-aware reports.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="card-shell p-3"><p className="text-xs text-muted">Total meetings</p><p className="text-2xl font-bold">{stats.meetings}</p></div>
            <div className="card-shell p-3"><p className="text-xs text-muted">Detected languages</p><p className="text-2xl font-bold">{stats.languages}</p></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => navigate("/history")} variant="ghost"><PlayCircle size={16} /> View History</Button>
            <Button onClick={() => navigate("/speakers")} variant="ghost"><Mic size={16} /> Register Speaker</Button>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg">Generate Report</h2>
          <div className="mt-4 space-y-3">
            <label className="text-sm text-muted">Drag & Drop / Upload file</label>
            <label className="input-shell flex cursor-pointer items-center justify-center gap-2 border-dashed py-6 text-sm">
              <FileUp size={17} /> {file ? file.name : "Choose audio/video"}
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            <label className="text-sm text-muted">YouTube URL</label>
            <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            <label className="text-sm text-muted">Report language</label>
            <Select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="auto">Auto</option><option value="fr">French</option><option value="en">English</option><option value="ar">Arabic</option>
            </Select>
            <Button onClick={submit} disabled={busy}><WandSparkles size={16} /> {busy ? "Starting..." : "Generate Report"}</Button>
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-4 flex items-center gap-2"><Link2 size={16} /><h3 className="font-display text-lg">Recent Reports</h3></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {reports.slice(0, 6).map((r) => (
            <button key={r.id} onClick={() => navigate(`/reports/${r.id}`)} className="card-shell text-left transition hover:scale-[1.01]">
              <p className="font-semibold">Report #{r.id}</p>
              <p className="text-sm text-muted">{formatDate(r.created_at)}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-accent">{r.report_language || "en"}</p>
            </button>
          ))}
        </div>
      </Card>
    </Page>
  );
}
