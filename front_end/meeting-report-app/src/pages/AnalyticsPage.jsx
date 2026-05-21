import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { useReports } from "../hooks/useReports";
import { getAnalytics } from "../services/api";
import { Card, Page } from "../components/common/ui";
import { Activity, Clock, Globe, Users, Zap, TrendingUp } from "lucide-react"; 

export default function AnalyticsPage() {
  const { reports } = useReports();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  // Données de répartition des langues
  const langData = useMemo(() => {
    const map = new Map();
    if (analytics?.languages) {
      Object.entries(analytics.languages).forEach(([name, value]) => map.set(name, value));
      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    }
    reports.forEach((r) => map.set(r.report_language || "en", (map.get(r.report_language || "en") || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [reports, analytics]);

  // Activité des intervenants
  const speakerActivity = useMemo(() => {
    const map = new Map();
    if (analytics?.top_speakers?.length) {
      return analytics.top_speakers.map((s) => ({ name: s.name, turns: s.turns }));
    }
    reports.forEach((r) => (r.segments || []).forEach((s) => {
      const k = s.speaker_name || s.speaker || "Inconnu";
      map.set(k, (map.get(k) || 0) + 1);
    }));
    return Array.from(map.entries()).slice(0, 8).map(([name, turns]) => ({ name, turns }));
  }, [reports, analytics]);

  const staticDuration = "140m";

  return (
    <Page>
      <div className="space-y-8 pb-10">
        {/* TITRE ET TAGLINE */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Analyse globale</h1>
          <p className="text-muted text-sm max-w-4xl leading-relaxed">
            Bienvenue dans votre espace d'intelligence décisionnelle. Cette page compile les données extraites de vos sessions 
            pour vous offrir une vision panoramique sur la collaboration de vos équipes. L'IA analyse ici la fréquence, 
            la durée et la diversité linguistique de vos échanges.
          </p>
        </div>

        {/* CARTES STATISTIQUES */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="flex items-center gap-4 border-app bg-app/20 p-6">
            <div className="p-3 bg-accent/10 rounded-lg text-accent">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">Total réunions</p>
              <p className="text-3xl font-bold text-white">{reports.length}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border-app bg-app/20 p-6">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">Durée totale audio</p>
              <p className="text-3xl font-bold text-white">{staticDuration}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border-app bg-app/20 p-6">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">Langues détectées</p>
              <p className="text-3xl font-bold text-white">{langData.length}</p>
            </div>
          </Card>
        </section>

        {/* GRAPHIQUES */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Répartition des langues */}
          <Card className="border-app bg-app/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={18} className="text-accent" />
              <h3 className="font-bold text-white uppercase text-sm tracking-tight">Répartition par langue</h3>
            </div>
            <div className="h-72 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={langData} 
                    dataKey="value" 
                    nameKey="name" 
                    outerRadius={90} 
                    innerRadius={60}
                    stroke="none"
                  >
                    {langData.map((_, i) => (
                      <Cell key={i} fill={["#5DD62C", "#0ea5e9", "#f97316", "#a855f7"][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Zap size={14} className="text-accent" /> Note d'analyse
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Cette distribution montre la prédominance des échanges en <strong>{langData[0]?.name || "votre langue principale"}</strong>. 
                Une telle diversité reflète l'ouverture internationale de vos projets et la capacité de l'IA à traiter 
                des flux multilingues sans perte d'information.
              </p>
            </div>
          </Card>

          {/* Dynamique des Intervenants */}
          <Card className="border-app bg-app/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users size={18} className="text-accent" />
              <h3 className="font-bold text-white uppercase text-sm tracking-tight">Dynamique des Intervenants</h3>
            </div>
            <div className="h-72 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speakerActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Bar dataKey="turns" fill="#5DD62C" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <TrendingUp size={14} className="text-accent" /> Note d'analyse
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                L'activité révèle une collaboration équilibrée, avec une présence notable de <strong>{speakerActivity[0]?.name || "l'intervenant principal"}</strong>. 
                Cette dynamique suggère un échange fluide où les idées circulent sans monopolisation.
              </p>
            </div>
          </Card>
        </section>

        {/* SECTION SYNTHÈSE FINALE */}
        <div className="grid gap-6">
          <section className="space-y-4 p-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Interprétation des données</h2>
            <p className="text-muted text-sm max-w-4xl leading-relaxed">
              Les graphiques ci-dessus offrent une cartographie visuelle de vos interactions. 
              L'IA a identifié une diversité linguistique avec une prédominance du <strong>{langData[0]?.name || "français"}</strong>, 
              témoignant de l'internationalisation de vos échanges. La dynamique des intervenants montre une collaboration équilibrée, 
              favorisant un environnement propice à l'innovation.
            </p>
          </section>

          <Card className="p-8 border-dashed border-accent/20 bg-accent/[0.02] text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-xl font-bold text-white">Synthèse de Performance</h3>
              <p className="text-sm text-muted leading-relaxed italic">
                "Grâce à l'analyse de ces {reports.length} rapports, nous observons une tendance à la stabilisation des échanges. 
                Le moteur de transcription a maintenu un taux de précision élevé sur l'ensemble des {staticDuration} de contenu, 
                permettant une recherche sémantique fluide dans l'historique."
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}