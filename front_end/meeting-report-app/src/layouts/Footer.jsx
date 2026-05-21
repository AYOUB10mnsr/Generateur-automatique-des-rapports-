import React from 'react';
import * as Lucide from 'lucide-react';
import { NavLink } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  // Helper pour éviter le crash si une icône est undefined
  const Icon = ({ name, size = 18, ...props }) => {
    const LucideIcon = Lucide[name];
    if (!LucideIcon) return null; // Si l'icône n'existe pas, on n'affiche rien au lieu de crash
    return <LucideIcon size={size} {...props} />;
  };

  return (
    <footer className="border-t border-app bg-[#0a0a0a] pt-12 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Section Logo & Bio */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-accent flex items-center justify-center shadow-neon">
                <Icon name="Zap" className="text-black" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">PayNote</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Intelligent Meeting Assistant powered by AI. Transcribe and analyze your meetings.
            </p>
            <div className="flex gap-4 mt-2">
              {/* On utilise des noms génériques très stables */}
              <a href="#" className="text-muted hover:text-accent transition-colors"><Icon name="Globe" /></a>
              <a href="#" className="text-muted hover:text-accent transition-colors"><Icon name="Cpu" /></a>
              <a href="#" className="text-muted hover:text-accent transition-colors"><Icon name="MessageSquare" /></a>
            </div>
          </div>

          {/* Colonne Navigation */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Product</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li><NavLink to="/dashboard" className="hover:text-accent transition-colors">Dashboard</NavLink></li>
              <li><NavLink to="/analytics" className="hover:text-accent transition-colors">Analytics</NavLink></li>
              <li><NavLink to="/settings" className="hover:text-accent transition-colors">Settings</NavLink></li>
            </ul>
          </div>

          {/* Colonne Resources */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Resources</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li><a href="#" className="hover:text-accent transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Privacy</a></li>
            </ul>
          </div>

          {/* Section Status */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Status</h3>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Icon name="Mail" size={16} />
              <span>support@paynote.ai</span>
            </div>
            <div className="mt-2 p-3 rounded-lg border border-app bg-white/5 text-[11px] text-muted font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                SYSTEM ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-app/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-[12px] font-mono">
            © {currentYear} PayNote.
          </p>
          <div className="flex gap-6 text-[12px] font-mono text-muted">
            <span>v1.0.4</span>
            <span className="text-accent/50 underline decoration-accent/20">SECURE_ENV</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;