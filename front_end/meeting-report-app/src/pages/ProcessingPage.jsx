import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TerminalSquare } from "lucide-react";
import { fakeLogLines, pipelineSteps } from "../animations/pipeline";
import { Button, Card, Page } from "../components/common/ui";

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((v) => Math.min(v + 1, pipelineSteps.length - 1)), 1300);
    return () => clearInterval(t);
  }, []);

  const progress = useMemo(() => Math.round(((index + 1) / pipelineSteps.length) * 100), [index]);

  return (
    <Page>
      <Card>
        <h1 className="font-display text-2xl">AI Pipeline Processing</h1>
        <p className="text-sm text-muted">Source: {state?.source || "meeting input"} | Language: {state?.lang || "auto"}</p>
        <div className="mt-6 h-3 overflow-hidden rounded-full border border-app">
          <motion.div className="h-full bg-[linear-gradient(90deg,#22c55e,#34d399)]" animate={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-accent">{progress}% completed</p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {pipelineSteps.map((step, i) => (
            <div key={step} className={`card-shell p-3 ${i <= index ? "shadow-neon" : "opacity-60"}`}>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2"><TerminalSquare size={16} /><h2 className="font-display">Terminal Logs</h2></div>
        <div className="rounded-xl border border-app bg-black/70 p-3 font-mono text-xs text-emerald-300">
          {fakeLogLines.slice(0, index + 1).map((line) => <p key={line} className="py-1">{line}</p>)}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => navigate(state?.result?.report_id ? `/reports/${state.result.report_id}` : "/history")}>Open Report</Button>
      </div>
    </Page>
  );
}
