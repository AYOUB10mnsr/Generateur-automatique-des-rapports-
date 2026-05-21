import React, { useEffect, useState } from "react";
import { 
  Pencil, Plus, Trash2, Upload, Users, Mic2, 
  Info, Fingerprint, ShieldCheck, Activity 
} from "lucide-react";
import { toast } from "sonner";
import { 
  addSpeakerSamples, 
  deleteSpeakerById, 
  listSpeakers, 
  registerSpeaker, 
  renameSpeakerById 
} from "../services/api";
import { Button, Card, Input, Page } from "../components/common/ui";

export default function SpeakerManagementPage() {
  const [speakers, setSpeakers] = useState([]);
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);

  const load = async () => {
    const data = await listSpeakers();
    setSpeakers(Array.isArray(data) ? data : data?.items || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name || !files.length) return toast.error("Nom et échantillons requis");
    setIsRegistering(true);
    try {
      await registerSpeaker({ name, samples: files });
      setName(""); 
      setFiles([]); 
      toast.success("Speaker identifié avec succès"); 
      load();
    } catch (error) {
      toast.error("Erreur lors de la création");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Page>
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER & INTRO */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-bold text-white tracking-tight">
              Speaker Management
            </h1>
            <p className="text-muted text-lg max-w-2xl leading-relaxed">
              Gérez les intervenants enregistrés et améliorez la reconnaissance automatique des voix dans vos réunions.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-right">
             <span className="text-accent text-xs font-mono tracking-widest uppercase">Identification automatique</span>
             <span className="text-muted text-[10px] font-mono">Une voix. Une identité.</span>
          </div>
        </div>

        {/* REGISTRATION SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-8 border-app bg-app/40 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded bg-accent/10 text-accent">
                <Fingerprint size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Identification vocale intelligente</h2>
                <p className="text-sm text-muted">Ajoutez des échantillons vocaux pour l'IA.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Input 
                placeholder="Nom de l'intervenant" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-black/20 border-app text-white"
              />
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-app hover:border-accent hover:bg-accent/5 transition-all px-4 text-sm text-muted">
                <Upload size={18} className="text-accent" /> 
                {files.length ? `${files.length} échantillon(s)` : "Upload audio"}
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  onChange={(e) => setFiles(Array.from(e.target.files || []))} 
                />
              </label>
              <Button variant="primary" onClick={create} disabled={isRegistering} className="shadow-neon">
                {isRegistering ? "Analyse vocale..." : <><Plus size={18} /> Register Speaker</>}
              </Button>
            </div>
            
            <p className="mt-6 text-[12px] text-muted italic flex items-start gap-2">
              <Info size={14} className="mt-0.5 shrink-0 text-accent" />
              Le système compare les voix détectées avec les empreintes vocales enregistrées pour associer chaque intervention au bon locuteur.
            </p>
          </Card>

          {/* HELP CARD */}
          <Card className="p-6 border-app bg-accent/5">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Mic2 size={16} className="text-accent" /> Pour de meilleurs résultats
            </h3>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                Parlez clairement pendant 20 à 30s
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                Utilisez un environnement calme
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                Évitez les bruits de fond
              </li>
            </ul>
          </Card>
        </div>

        {/* SPEAKERS LIST SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-app pb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Users size={20} className="text-accent" /> Intervenants Enregistrés
            </h2>
            <span className="text-xs font-mono text-muted bg-white/5 px-3 py-1 rounded-full uppercase tracking-tighter">
              {speakers.length} Identités stockées
            </span>
          </div>

          {speakers.length === 0 ? (
            <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-app bg-white/5">
              <div className="inline-flex p-4 rounded-full bg-white/5 text-muted mb-2">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-medium text-white">Aucun intervenant enregistré pour le moment.</h3>
              <p className="text-muted max-w-sm mx-auto">
                Commencez par ajouter des échantillons vocaux afin d’activer la reconnaissance intelligente des speakers.
              </p>
            </div>
          ) : (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {speakers.map((s) => (
                <Card key={s.id} className="group overflow-hidden border-app bg-app/20 hover:bg-app/40 transition-all p-6 space-y-5">
                  {/* Ligne accent pure #5DD62C */}
                  <div className="h-1.5 w-full rounded-full bg-[#5DD62C] shadow-[0_0_10px_rgba(93,214,44,0.3)]" />
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-display text-xl font-bold text-white group-hover:text-accent transition-colors">{s.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-accent uppercase tracking-tighter">
                        <Activity size={12} /> Reconnaissance IA active
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 text-muted">
                      <Fingerprint size={20} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-app/50">
                    <div>
                      <p className="text-[10px] uppercase text-muted font-bold">Échantillons</p>
                      <p className="text-sm text-white font-mono">{s.samples_count || 0} Voix analysées</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted font-bold">Dernière activité</p>
                      <p className="text-sm text-white font-mono">Récent</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 text-xs py-2 bg-white/5 hover:bg-white/10"
                      onClick={async () => {
                        const newName = prompt("Nouveau nom", s.name);
                        if (!newName) return;
                        await renameSpeakerById(s.id, newName);
                        load();
                      }}
                    >
                      <Pencil size={14} className="mr-2" /> Rename
                    </Button>
                    
                    <label className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent cursor-pointer text-xs transition-all">
                      <Plus size={14} /> Add Samples
                      <input 
                        className="hidden" 
                        type="file" 
                        multiple 
                        onChange={async (e) => { 
                          const f = Array.from(e.target.files || []); 
                          if (!f.length) return; 
                          const t = toast.loading("Création de l’empreinte vocale...");
                          await addSpeakerSamples(s.id, f); 
                          toast.success("Voix analysée et ajoutée", { id: t }); 
                          load(); 
                        }} 
                      />
                    </label>
                    
                    <Button 
                      variant="ghost" 
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={async () => { 
                        if(confirm("Supprimer cet intervenant ?")) {
                          await deleteSpeakerById(s.id); 
                          load(); 
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </section>
          )}
        </div>

        {/* BOTTOM TAGLINE */}
        <div className="flex justify-center pt-10 border-t border-app">
          <div className="flex items-center gap-4 text-muted/40 text-[11px] font-mono uppercase tracking-[0.2em]">
            <span>L’IA qui comprend qui parle</span>
            <div className="w-1 h-1 rounded-full bg-accent/40"></div>
            <span>Sécurisé & Privé</span>
            <div className="w-1 h-1 rounded-full bg-accent/40"></div>
            <span>Reconnaissance avancée</span>
          </div>
        </div>
      </div>
    </Page>
  );
}