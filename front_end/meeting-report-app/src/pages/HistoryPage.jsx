import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Eye, Trash2, Calendar, Users, Clock, 
  Filter, FileText, Download, RefreshCw, ChevronRight, 
  CheckCircle2, AlertCircle, Loader2, Database
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { LoadingSpinner } from '../components/Loading';
import { useScrollToTop, useDebounce } from '../hooks/useCustom';
import { getReports } from '../services/api';

/**
 * History Page - Historique complet des rapports avec recherche et filtres IA
 */
function HistoryPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getReports();
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Filtrage et Tri
  useEffect(() => {
    let filtered = [...reports];

    if (debouncedSearchTerm) {
      filtered = filtered.filter((report) =>
        report.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    setFilteredReports(filtered);
  }, [reports, debouncedSearchTerm, sortBy]);

  // Helper pour les statuts
  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span className="flex items-center gap-1.5 text-accent"><CheckCircle2 size={14}/> Rapport finalisé</span>;
      case 'processing': return <span className="flex items-center gap-1.5 text-blue-400"><Loader2 size={14} className="animate-spin"/> En cours de traitement...</span>;
      case 'failed': return <span className="flex items-center gap-1.5 text-red-400"><AlertCircle size={14}/> Échec de génération</span>;
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold text-white tracking-tight">
            Historique des rapports
          </h1>
          <p className="text-muted text-lg max-w-3xl">
            Consultez, recherchez et gérez toutes vos réunions analysées par l’intelligence artificielle.
          </p>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-accent text-[10px] font-mono tracking-widest uppercase">Mémoire Digitale</p>
          <p className="text-muted text-[10px] font-mono italic">Analysez, retrouvez, exportez.</p>
        </div>
      </div>

      {/* INTRO INFO SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-app/40 border-app flex items-center gap-4 p-6">
          <div className="p-3 rounded-full bg-accent/10 text-accent shrink-0">
            <Database size={24} />
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Retrouvez l’ensemble des rapports générés automatiquement à partir de vos réunions audio et vidéo, 
            avec transcription, identification des intervenants et résumé intelligent.
          </p>
        </Card>
        
        <Card className="bg-accent/5 border-accent/20 p-6 flex flex-col justify-center">
          <h4 className="text-white text-xs font-bold uppercase mb-2">Centralisation intelligente</h4>
          <p className="text-[11px] text-muted leading-tight">
            Tous vos rapports sont stockés de manière sécurisée et accessibles à tout moment.
          </p>
        </Card>
      </div>

      {/* FILTER SECTION */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-white/80 mb-2">
          <Filter size={16} className="text-accent" />
          <span className="text-sm font-semibold uppercase tracking-wider">Filtrer les rapports</span>
        </div>
        
        <Card className="p-4 bg-app/20 border-app">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Rechercher un rapport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/20 border border-app text-white focus:border-accent focus:outline-none transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select className="bg-black/20 border border-app text-xs text-muted rounded-lg px-4 py-2 focus:border-accent outline-none">
                <option>Toutes les langues</option>
                <option>Français</option>
                <option>Anglais</option>
              </select>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/20 border border-app text-xs text-muted rounded-lg px-4 py-2 focus:border-accent outline-none"
              >
                <option value="date">Plus récents</option>
                <option value="title">Nom (A-Z)</option>
              </select>

              <div className="flex bg-black/20 border border-app rounded-lg p-1">
                {['Aujourd’hui', 'Cette semaine', 'Ce mois-ci'].map((period) => (
                  <button key={period} className="px-3 py-1 text-[10px] text-muted hover:text-white transition-colors">
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* REPORTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-app pb-4">
          <h2 className="text-xl font-semibold text-white">Rapports générés</h2>
          <span className="text-xs font-mono text-muted">{filteredReports.length} éléments trouvés</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted animate-pulse">Chargement de l'historique...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="text-center py-20 border-dashed border-app bg-white/5">
            <div className="w-16 h-16 bg-app/50 rounded-full flex items-center justify-center mx-auto mb-4 text-muted">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun rapport disponible</h3>
            <p className="text-muted max-w-sm mx-auto mb-8 text-sm">
              Lancez votre première analyse pour commencer à générer automatiquement des comptes rendus de réunions.
            </p>
            <Button variant="primary" onClick={() => navigate('/upload')} className="shadow-neon">
              Nouvelle Analyse
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                className="group hover:bg-app/40 border-app transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-2">
                  
                  {/* Info Principale */}
                  <div className="flex gap-4 items-start">
                    <div className="p-3 rounded-xl bg-accent/5 text-accent group-hover:bg-accent group-hover:text-black transition-all">
                      <FileText size={24} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-accent transition-colors">
                        {report.title}
                      </h3>
                      <div className="flex flex-wrap gap-y-2 gap-x-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Calendar size={14} className="text-accent" />
                          <span>Date : {new Date(report.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Clock size={14} className="text-accent" />
                          <span>Durée : {report.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Users size={14} className="text-accent" />
                          <span>{report.participants} intervenants</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statut & Actions */}
                  <div className="flex flex-wrap items-center gap-4 lg:justify-end shrink-0 border-t lg:border-t-0 border-app pt-4 lg:pt-0">
                    <div className="text-xs font-mono mr-4">
                      {getStatusBadge(report.status || 'completed')}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        className="h-9 px-4 text-xs gap-2"
                        onClick={() => navigate(`/report/${report.id}`)}
                      >
                        <Eye size={14} /> Ouvrir
                      </Button>
                      
                      <Button
                        variant="secondary"
                        className="h-9 w-9 p-0"
                        title="Télécharger PDF"
                        onClick={(e) => { e.stopPropagation(); /* Logic */ }}
                      >
                        <Download size={14} />
                      </Button>

                      <Button
                        variant="secondary"
                        className="h-9 w-9 p-0 hover:bg-red-500/20 hover:text-red-400 border-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Supprimer ce rapport ?')) {
                             // Delete Logic
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="h-9 w-9 p-0 text-muted"
                        title="Réanalyser"
                      >
                        <RefreshCw size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER TAGLINES */}
      <div className="flex flex-col items-center gap-4 pt-10 border-t border-app">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-muted/30 text-[10px] font-mono uppercase tracking-[0.3em]">
          <span>Votre mémoire de réunions</span>
          <div className="w-1 h-1 rounded-full bg-accent/30 hidden md:block"></div>
          <span>Tous vos comptes rendus au même endroit</span>
          <div className="w-1 h-1 rounded-full bg-accent/30 hidden md:block"></div>
          <span>L’IA garde tout en mémoire</span>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;