import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalSquare, Cpu, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { fakeLogLines, pipelineSteps } from "../animations/pipeline";
import { Button, Card, Page } from "../components/common/ui";

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [index, setIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((v) => {
        if (v >= pipelineSteps.length - 1) {
          clearInterval(t);
          setIsFinished(true);
          return v;
        }
        return v + 1;
      });
    }, 1800); // Temps légèrement augmenté pour laisser lire
    return () => clearInterval(t);
  }, []);

  const progress = useMemo(() => Math.round(((index + 1) / pipelineSteps.length) * 100), [index]);

  return (
    <Page>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white tracking-tighter flex items-center justify-center md:justify-start gap-3">
            <Cpu className="text-accent animate-pulse" />
            Traitement par Intelligence Artificielle
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-2xl">
            Nos algorithmes analysent votre contenu pour en extraire la substantifique moelle. 
            Source détectée : <span className="text-white font-mono">{state?.source || "Input Direct"}</span> | 
            Langue : <span className="text-white font-mono uppercase">{state?.lang || "Auto-détection"}</span>
          </p>
        </div>

        {/* PROGRESS CARD */}
        <Card className="border-app bg-app/20 p-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-accent font-bold uppercase tracking-widest text-xs mb-1">Status du pipeline</h2>
              <p className="text-white text-lg font-medium">
                {isFinished ? "Analyse terminée avec succès" : pipelineSteps[index]}...
              </p>
            </div>
            <p className="text-2xl font-mono font-bold text-accent">{progress}%</p>
          </div>

          <div className="h-4 overflow-hidden rounded-full border border-app bg-black/40 p-1">
            <motion.div 
              className="h-full rounded-full bg-[linear-gradient(90deg,#5DD62C,#34d399)] shadow-[0_0_15px_rgba(93,214,44,0.5)]" 
              animate={{ width: `${progress}%` }} 
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* DÉTAILS DES ÉTAPES */}
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {pipelineSteps.map((step, i) => (
              <div 
                key={step} 
                className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-500 ${
                  i <= index 
                  ? "border-accent/40 bg-accent/5 shadow-[0_0_20px_rgba(93,214,44,0.05)]" 
                  : "border-white/5 opacity-40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    i < index ? "bg-accent text-black" : i === index ? "bg-accent/20 text-accent animate-spin" : "bg-white/10 text-white"
                  }`}>
                    {i < index ? "✓" : i === index ? <Loader2 size={12} /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${i <= index ? "text-white" : "text-muted"}`}>{step}</span>
                </div>
                {i === index && !isFinished && (
                  <motion.p 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-2 text-[11px] text-muted italic ml-9"
                  >
                    Optimisation des vecteurs de données en cours...
                  </motion.p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* TERMINAL LOGS */}
        <Card className="border-app bg-black/60 p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-app bg-white/5">
            <TerminalSquare size={14} className="text-accent" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">Flux système en temps réel</span>
          </div>
          <div className="p-4 font-mono text-[11px] h-48 overflow-y-auto space-y-1 text-emerald-400/80">
            <AnimatePresence>
              {fakeLogLines.slice(0, index + 3).map((line, idx) => (
                <motion.p 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <span className="text-white/20">[{new Date().toLocaleTimeString()}]</span>
                  <span className={idx % 3 === 0 ? "text-accent" : ""}>{line}</span>
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </Card>

        {/* ACTION FOOTER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-4 text-muted">
             <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <ShieldCheck size={14} className="text-accent" />
                <span className="text-[10px] uppercase font-bold">Sécurisé par Chiffrement AES-256</span>
             </div>
             <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-purple-400">
                <Sparkles size={14} />
                <span className="text-[10px] uppercase font-bold">Modèle GPT-4 Turbo</span>
             </div>
          </div>

          <Button 
            disabled={!isFinished}
            className={`min-w-[200px] h-12 text-sm font-bold uppercase tracking-widest transition-all ${
              isFinished ? "bg-accent text-black hover:scale-105 shadow-neon" : "opacity-50"
            }`}
            onClick={() => navigate(state?.result?.report_id ? `/reports/${state.result.report_id}` : "/history")}
          >
            {isFinished ? "Consulter le rapport" : "Traitement en cours..."}
          </Button>
        </div>
      </div>
    </Page>
  );
}