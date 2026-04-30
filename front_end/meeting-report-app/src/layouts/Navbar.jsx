import React from 'react';
import { NavLink } from 'react-router-dom';
import { Film } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

function Navbar({ theme, onToggleTheme }) {
  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-smooth ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`;

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-700 shadow-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-300 transition-smooth">
            <Film className="w-6 h-6 text-blue-500 dark:text-cyan-300" />
            <span>MeetAI</span>
          </NavLink>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/upload" className={navLinkClass}>
              Upload
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/history" className={navLinkClass}>
              History
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>

        <div className="md:hidden mt-4 pb-4 flex gap-4">
          <NavLink to="/" className={({ isActive }) => `flex-1 text-center py-2 text-sm ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`} end>
            Home
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => `flex-1 text-center py-2 text-sm ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
            Upload
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `flex-1 text-center py-2 text-sm ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
            Dashboard
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `flex-1 text-center py-2 text-sm ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
            History
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
