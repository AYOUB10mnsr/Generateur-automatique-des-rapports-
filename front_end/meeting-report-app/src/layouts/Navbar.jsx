import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, Sun, Moon, Settings } from 'lucide-react'; // 1. Ajout de l'icône Settings

function Navbar({ theme, onToggleTheme }) {
  const isCyber = theme === 'cyber';

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
      isActive 
        ? 'text-accent bg-accent/10 border border-accent/30' 
        : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  return (
    <nav className="sticky top-0 z-40 border-b border-app bg-app/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center group-hover:scale-105 transition-transform shadow-neon">
              <Zap size={18} className="text-black" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-accent transition-colors">
              PayNote
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass} end>Home</NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/history" className={navLinkClass}>History</NavLink>
            <NavLink to="/speakers" className={navLinkClass}>Speakers</NavLink>
            <NavLink to="/analytics" className={navLinkClass}>Analytics</NavLink>
            <NavLink to="/ai-search" className={navLinkClass}>AI Search</NavLink>
            
            {/* 2. Ajout de l'onglet Settings juste ici */}
            <NavLink to="/settings" className={navLinkClass}>Settings</NavLink>
          </div>

          {/* Theme Toggle + CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-app text-muted hover:text-accent hover:border-accent transition-all"
              title={isCyber ? 'Switch to Light' : 'Switch to Cyber'}
            >
              {isCyber ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <NavLink
              to="/dashboard"
              className="hidden md:flex px-4 py-2 bg-accent text-black text-sm font-semibold rounded-lg hover:bg-[#4ec124] transition-all shadow-neon"
            >
              New Report
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
