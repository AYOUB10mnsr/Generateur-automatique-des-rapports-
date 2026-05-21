/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        sans: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
      colors: {
        background: 'var(--bg)',
        surface: 'var(--card)',
        accent: 'var(--accent)',
        border: 'var(--border)',
        'text-primary': 'var(--text)',
        'text-secondary': 'var(--muted)',
      },
    },
  },
  plugins: [],
};