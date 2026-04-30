import React from 'react';
import { Moon, Sun } from 'lucide-react';

function ThemeToggle({ theme = 'light', onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-2 text-slate-700 shadow-sm transition-smooth hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle color theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export default ThemeToggle;
