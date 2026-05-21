import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Download, 
  Trash2, 
  Search, 
  FileText, 
  ExternalLink, 
  Calendar, 
  Languages, 
  Database,
  ChevronLeft, 
  ChevronRight, 
  Info 
} from "lucide-react";
import { toast } from "sonner";
import { useReports } from "../hooks/useReports";
import { deleteReportById, downloadReportPdf } from "../services/api";
import { useDebounce } from "../hooks/useDebounce";
import { Button, Card, Input, Page, Select } from "../components/common/ui";
import { downloadBlob, formatDate } from "../utils";

export default function ReportsHistoryPage() {
  const navigate = useNavigate();
  const { reports, setReports, loading } = useReports();
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("all");
  const [page, setPage] = useState(1);
  const q = useDebounce(search);

  const filtered = useMemo(() => reports.filter((r) => {
    const okSearch = !q || `${r.id} ${r.summary || ""}`.toLowerCase().includes(q.toLowerCase());
    const okLang = lang === "all" || (r.report_language || "en") === lang;
    return okSearch && okLang;
  }), [reports, q, lang]);

  const pageSize = 8;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  const remove = async (id) => {
    if(!confirm("Supprimer ce rapport ?")) return;
    try {
      await deleteReportById(id);
      setReports((p) => p.filter((r) => r.id !== id));
      toast.success("Rapport supprimé");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <Page>
      <div className="space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Historique des rapports</h1>
            <p className="text-muted text-sm max-w-2xl">
              Consultez, recherchez et gérez toutes vos réunions analysées par l’intelligence artificielle.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Votre mémoire de réunions</span>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <Card className="p-4 border-app bg-app/20">
          <div className="grid gap-4 md:grid-cols-[1fr_200px_auto]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-muted" />
              <Input 
                className="pl-10 bg-black/20 border-app focus:border-accent" 
                placeholder="     Rechercher un rapport..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            
            <Select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-black/20 border-app text-sm"
            >
              <option value="all">Toutes les langues</option>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="ar">Arabe</option>
            </Select>

            <div className="flex bg-black/40 rounded-lg p-1 border border-app shrink-0">
               <button className="px-3 py-1 text-[10px] text-accent font-bold uppercase tracking-tighter hover:bg-white/5 rounded">Aujourd’hui</button>
               <button className="px-3 py-1 text-[10px] text-muted hover:text-white rounded transition-colors">Ce mois-ci</button>
            </div>
          </div>
        </Card>

        {/* MAIN CONTENT SECTION */}
        <div className="grid gap-6">
          <div className="flex items-center gap-2 text-white/80">
            <Database size={18} className="text-accent" />
            <h2 className="text-lg font-semibold italic">Rapports générés</h2>
          </div>

          <Card className="overflow-hidden border-app bg-app/10 p-0">
            {loading ? (
              <div className="p-20 text-center text-muted animate-pulse font-mono uppercase tracking-widest text-xs">
                Chargement des données...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <FileText size={48} className="mx-auto text-muted/20" />
                <h3 className="text-xl font-medium text-white">Aucun rapport disponible</h3>
                <p className="text-sm text-muted max-w-xs mx-auto">
                  Lancez votre première analyse pour commencer à générer automatiquement des rapports.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted/60 border-b border-app bg-white/[0.02]">
                      <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Rapport</th>
                      <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Date de création</th>
                      <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Langue</th>
                      <th className="px-6 py-4 text-right font-medium uppercase tracking-wider text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app">
                    {items.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-black transition-all">
                              <FileText size={16} />
                            </div>
                            <span className="font-mono text-white">rapport numéro #{r.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-accent/50" />
                            {formatDate(r.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded bg-white/5 border border-app text-[10px] uppercase font-bold text-accent">
                            {r.report_language || "en"}
                          </span>
                        </td>
                       <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-3 justify-end">
                          
                          {/* BOUTON VOIR */}
                          <Button 
                            variant="ghost" 
                            className="h-8 px-3 text-[10px] font-bold border border-white/10 hover:bg-white/10 flex items-center gap-2"
                            onClick={() => navigate(`/reports/${r.id}`)}
                          >
                            <Eye size={14} />
                            <span>VOIR</span>
                          </Button>
                          
                          {/* BOUTON TÉLÉCHARGER - On force le texte et l'icône */}
                          <Button 
                            variant="ghost" 
                            className="h-8 px-3 text-[10px] font-bold border border-[#5DD62C]/40 text-[#5DD62C] bg-[#5DD62C]/5 hover:bg-[#5DD62C] hover:text-black transition-all flex items-center gap-2"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const data = await downloadReportPdf(r.id);
                              downloadBlob(data, `report-${r.id}.pdf`);
                            }}
                          >
                            <Download size={14} />
                            <span>TÉLÉCHARGER</span>
                          </Button>

                          {/* BOUTON SUPPRIMER - On force le texte et l'icône */}
                          <Button 
                            variant="ghost" 
                            className="h-8 px-3 text-[10px] font-bold border border-red-500/40 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              remove(r.id);
                            }}
                          >
                            <Trash2 size={14} />
                            <span>SUPPRIMER</span>
                          </Button>

                        </div>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* PAGINATION */}
            <div className="p-4 flex items-center justify-between border-t border-app bg-white/[0.01]">
              <p className="text-[10px] text-muted font-mono uppercase tracking-widest">
                Analysez, retrouvez, exportez.
              </p>
              <div className="flex items-center gap-4">
                <p className="text-xs font-mono text-muted">Page <span className="text-accent">{page}</span> sur {pages}</p>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 border border-app disabled:opacity-20" 
                    disabled={page <= 1} 
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 border border-app disabled:opacity-20" 
                    disabled={page >= pages} 
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* INFO SECTION */}
        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-app">
          <div className="flex gap-3 items-start p-4 bg-accent/5 rounded-xl border border-accent/10">
            <Info size={20} className="text-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">Centralisation intelligente</h4>
              <p className="text-xs text-muted leading-relaxed">
                Tous vos rapports sont stockés de manière sécurisée et accessibles à tout moment. L’intelligence artificielle garde tout en mémoire.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-end opacity-40">
             <p className="text-[10px] font-mono tracking-[0.3em] uppercase">Tous vos comptes rendus au même endroit.</p>
          </div>
        </div>

      </div>
    </Page>
  );
}