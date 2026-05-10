import { Link, useLocation } from "react-router-dom";
import { BarChart3, FileClock, Home, Mic2, Settings, Sparkles } from "lucide-react";
import ThemeSwitcher from "../components/common/ThemeSwitcher";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/history", label: "History", icon: FileClock },
  { to: "/speakers", label: "Speakers", icon: Mic2 },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-app text-app">
      <div className="pointer-events-none fixed inset-0 app-grid" />
      <header className="sticky top-0 z-40 border-b border-app bg-app/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-app bg-card p-2 shadow-neon">
              <Sparkles size={18} className="text-accent" />
            </div>
            <div>
              <p className="font-display text-sm tracking-[0.25em] text-accent">AI MEETING ASSISTANT</p>
              <p className="text-xs text-muted">Multilingual Speaker Intelligence Platform</p>
            </div>
          </div>
          <ThemeSwitcher />
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-auto px-4 pb-3 md:px-6">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} className={`chip ${active ? "chip-active" : ""}`}>
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
