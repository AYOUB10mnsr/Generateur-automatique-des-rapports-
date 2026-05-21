import React, { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  ServerCrash, 
  Palette, 
  Languages, 
  Users, 
  BrainCircuit, 
  ShieldCheck,
  Info
} from "lucide-react";
import { apiHealth } from "../services/api";
import { useSettings } from "../contexts/SettingsContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button, Card, Page, Select } from "../components/common/ui";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { 
    defaultLanguage, 
    setDefaultLanguage, 
    speakerThreshold, 
    setSpeakerThreshold, 
    aiModel, 
    setAiModel 
  } = useSettings();
  const [healthy, setHealthy] = useState(null);

  useEffect(() => { 
    apiHealth()
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false)); 
  }, []);

  return (
    <Page>
      {/* Augmentation de la largeur maximale ici (max-w-6xl) */}
      <div className="max-w-6xl mx-auto space-y-8 px-4">
        
        {/* En-tête de page */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold text-white tracking-tight">Configuration Système</h1>
          <p className="text-muted text-lg max-w-3xl leading-relaxed">
            Gérez les paramètres globaux de votre assistant **PayNote**. Ces réglages impactent directement la précision de la transcription et la qualité des synthèses générées.
          </p>
        </div>

        {/* Carte principale élargie */}
        <Card className="p-10 border-app bg-app/40 backdrop-blur-md shadow-2xl space-y-12">
          
          {/* Section: Interface & Localisation */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-accent">
                <Palette size={20} />
                <h2 className="text-xl font-semibold text-white">Apparence</h2>
              </div>
              <p className="text-sm text-muted">Personnalisez l'esthétique de votre interface et la langue de rendu des documents.</p>
            </div>

            <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Thème du Dashboard</label>
                <Select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full">
                  <option value="cyber">Cyber Mode (Neon Green)</option>
                  <option value="clean">Clean Professional (Dark)</option>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Langue par défaut</label>
                <Select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} className="w-full">
                  <option value="auto">Détection intelligente</option>
                  <option value="fr">Français (FR)</option>
                  <option value="en">English (US)</option>
                  <option value="ar">العربية (AR)</option>
                </Select>
              </div>
            </div>
          </section>

          <hr className="border-app/30" />

          {/* Section: Intelligence Artificielle & Audio */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-accent">
                <BrainCircuit size={20} />
                <h2 className="text-xl font-semibold text-white">Moteur IA</h2>
              </div>
              <p className="text-sm text-muted">Ajustez la sensibilité de l'algorithme de séparation des voix (Diarization).</p>
            </div>

            <div className="lg:col-span-2 grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <Users size={16} /> Sensibilité Vocale
                  </label>
                  <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    {Math.round(speakerThreshold * 100)}%
                  </span>
                </div>
                <input 
                  type="range" min="0.4" max="0.95" step="0.01" 
                  value={speakerThreshold} 
                  onChange={(e) => setSpeakerThreshold(Number(e.target.value))} 
                  className="w-full accent-accent bg-white/10 h-2 rounded-lg"
                />
                <div className="flex items-start gap-2 bg-white/5 p-3 rounded-lg">
                  <Info size={14} className="text-accent mt-0.5" />
                  <p className="text-[11px] text-muted leading-tight">
                    **Note :** Un seuil plus bas favorise la création de nouveaux locuteurs. Un seuil plus haut fusionne les segments audio similaires.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Modèle de Traitement</label>
                <Select value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="w-full">
                  <option value="llama-3.3-70b-versatile">Llama 3.3 Versatile (Optimisé)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Ultra-Rapide)</option>
                  <option value="gpt-4o">GPT-4o (Analyses Complexes)</option>
                </Select>
                <p className="text-[11px] text-muted px-1 italic">
                  Changer de modèle peut affecter la vitesse de génération du rapport final.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Infrastructure & Sécurité */}
          <div className="p-6 rounded-2xl border border-app bg-gradient-to-r from-black/60 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${healthy ? 'bg-accent shadow-[0_0_10px_#4ec124]' : 'bg-red-500'} animate-pulse`}></div>
                <h3 className="text-sm font-bold uppercase tracking-tighter text-white">État des Services Cloud</h3>
              </div>
              <p className="text-xs text-muted max-w-md">
                {healthy 
                  ? "Votre instance est correctement connectée aux serveurs de traitement sécurisés. Le chiffrement de bout en bout est actif." 
                  : "Connexion interrompue. Les analyses locales restent disponibles mais la synchronisation cloud est en pause."}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-mono text-muted uppercase">Niveau de sécurité</p>
                <p className="text-xs font-bold text-accent">AES-256 BIT</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-accent">
                <ShieldCheck size={28} />
              </div>
            </div>
          </div>

          {/* Footer de la carte */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
             <div className="flex items-center gap-2 text-xs text-muted font-mono">
               <span className="w-2 h-2 rounded-full bg-accent/30"></span>
               VERSION_HASH: 7f82b1c
             </div>
             <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-muted italic flex items-center gap-2">
               <CheckCircle2 size={14} className="text-accent" />
               Toutes les modifications sont appliquées instantanément
             </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}