import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileUp,
  Link2,
  Mic,
  PlayCircle,
  WandSparkles,
  Globe2,
  BrainCircuit,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

import { processMeeting } from "../services/api";
import { useSettings } from "../contexts/SettingsContext";
import { useReports } from "../hooks/useReports";

import {
  Card,
  Button,
  Input,
  Page,
  Select,
} from "../components/common/ui";

import { formatDate } from "../utils";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { defaultLanguage } = useSettings();
  const { reports } = useReports();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState(null);
  const [lang, setLang] = useState(defaultLanguage);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(
    () => ({
      meetings: reports.length,
      languages: new Set(
        reports.map((r) => r.report_language).filter(Boolean)
      ).size,
    }),
    [reports]
  );

  const submit = async () => {
    if (!file && !youtubeUrl) {
      return toast.error("Add file or YouTube URL first");
    }

    try {
      setBusy(true);

      const result = await processMeeting({
        file,
        youtubeUrl,
        lang,
      });

      toast.success("Pipeline started");

      navigate("/processing", {
        state: {
          result,
          source: file?.name || youtubeUrl,
          lang,
        },
      });
    } catch (e) {
      toast.error(e?.message || "Processing failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT HERO SECTION */}
        <Card className="relative overflow-hidden border border-[#5DD62C]/20 bg-[#0f0f0f]">
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,255,146,0.18),transparent_40%)]"
          />

          <div className="relative z-10">
            <p className="mb-3 inline-flex items-center rounded-full border border-[#5DD62C]/20 bg-[#5DD62C]/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-[#5DD62C]">
              AI Meeting Intelligence
            </p>

            <h1 className="font-display text-4xl leading-tight text-white">
              L’IA au service de vos réunions
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400">
              PayNote transforme automatiquement vos réunions audio et vidéo
              en rapports intelligents grâce à une pipeline avancée
              d’intelligence artificielle combinant transcription,
              diarization, identification vocale et génération automatique
              de contenu.
            </p>

            {/* STATS */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#5DD62C]/20 bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#5DD62C]">
                  Total Meetings
                </p>

                <p className="mt-3 text-4xl font-bold text-white">
                  {stats.meetings}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Réunions analysées automatiquement par l’intelligence artificielle.
                </p>
              </div>

              <div className="rounded-2xl border border-[#5DD62C]/20 bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#5DD62C]">
                  Languages Detected
                </p>

                <p className="mt-3 text-4xl font-bold text-white">
                  {stats.languages}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Langues détectées et utilisées dans vos réunions.
                </p>
              </div>
            </div>

            {/* FEATURE CARDS */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#5DD62C]/20 bg-black/30 p-5 transition hover:border-[#5DD62C]/50">
                <Mic className="mb-4 text-[#5DD62C]" size={24} />

                <h3 className="text-lg font-semibold text-white">
                  Speaker Identification
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Détection et reconnaissance automatique des différents intervenants.
                </p>
              </div>

              <div className="rounded-2xl border border-[#5DD62C]/20 bg-black/30 p-5 transition hover:border-[#5DD62C]/50">
                <BrainCircuit className="mb-4 text-[#5DD62C]" size={24} />

                <h3 className="text-lg font-semibold text-white">
                  Smart AI Reports
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Génération intelligente de résumés, décisions et actions importantes.
                </p>
              </div>

              <div className="rounded-2xl border border-[#5DD62C]/20 bg-black/30 p-5 transition hover:border-[#5DD62C]/50">
                <Globe2 className="mb-4 text-[#5DD62C]" size={24} />

                <h3 className="text-lg font-semibold text-white">
                  Multilingual Processing
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Support des réunions multilingues avec génération automatique des rapports.
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/history")}
                variant="ghost"
              >
                <PlayCircle size={16} />
                View History
              </Button>

              <Button
                onClick={() => navigate("/speakers")}
                variant="ghost"
              >
                <Mic size={16} />
                Register Speaker
              </Button>
            </div>

            {/* PIPELINE INFO */}
            <div className="mt-10 border-t border-[#5DD62C]/10 pt-6">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-[#5DD62C]" />

                <p className="text-sm uppercase tracking-[0.3em] text-[#5DD62C]">
                  Pipeline IA avancé
                </p>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400">
                Chaque réunion passe par une chaîne de traitement intelligente
                utilisant Whisper AI, Pyannote et des modèles avancés
                d’intelligence artificielle afin de produire des rapports
                professionnels précis, structurés et exportables.
              </p>
            </div>
          </div>
        </Card>

        {/* RIGHT PANEL */}
        <Card className="border border-[#5DD62C]/20 bg-[#0f0f0f]">
          <h2 className="font-display text-2xl text-white">
            Generate Report
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Importez un fichier audio, vidéo ou une réunion YouTube afin
            de lancer automatiquement l’analyse IA et générer un rapport intelligent.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Upload audio/video
              </label>

              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-[#5DD62C]/30 bg-black/30 py-8 text-sm text-gray-300 transition hover:border-[#5DD62C]">
                <FileUp size={18} className="text-[#5DD62C]" />

                {file ? file.name : "Choose audio or video file"}

                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                />
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                YouTube URL
              </label>

              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Report Language
              </label>

              <Select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="auto">Auto Detect</option>
                <option value="fr">French</option>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </Select>
            </div>

            <Button
              onClick={submit}
              disabled={busy}
              className="w-full bg-[#5DD62C] text-black hover:bg-[#72ff39]"
            >
              <WandSparkles size={16} />

              {busy ? "Starting Pipeline..." : "Generate AI Report"}
            </Button>
          </div>
        </Card>
      </section>

      {/* RECENT REPORTS */}
      <Card className="border border-[#5DD62C]/20 bg-[#0f0f0f]">
        <div className="mb-6 flex items-center gap-2">
          <Link2 size={18} className="text-[#5DD62C]" />

          <h3 className="font-display text-2xl text-white">
            Recent Reports
          </h3>
        </div>

        <p className="mb-6 text-sm text-gray-400">
          Consultez rapidement les dernières réunions analysées
          et les rapports générés automatiquement par l’intelligence artificielle.
        </p>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.slice(0, 6).map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(`/reports/${r.id}`)}
              className="rounded-2xl border border-[#5DD62C]/10 bg-black/30 p-5 text-left transition duration-300 hover:scale-[1.01] hover:border-[#5DD62C]/40"
            >
              <p className="text-lg font-semibold text-white">
                Report #{r.id}
              </p>

              <p className="mt-2 text-sm text-gray-400">
                {formatDate(r.created_at)}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-[#5DD62C]">
                  {r.report_language || "EN"}
                </p>

                <span className="rounded-full border border-[#5DD62C]/20 px-2 py-1 text-xs text-[#5DD62C]">
                  AI Generated
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </Page>
  );
}