import { MoonStar, Sparkles, SunMedium } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const cyber = theme === "cyber";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={toggleTheme}
      className="group relative flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-widest"
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 blur transition group-hover:opacity-100" />
      {cyber ? <MoonStar size={14} /> : <SunMedium size={14} />}
      <span>{cyber ? "Cyber" : "Clean"}</span>
      <Sparkles size={13} className="opacity-70" />
    </motion.button>
  );
}
