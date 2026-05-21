export { default } from "./DashboardPage";
import React, { useState, useRef } from 'react';

// ─── Icons (inline SVG minimalistes) ────────────────────────────────────────
const IconMic = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconFile = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconCpu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
);
const IconHistory = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 8 12 12 14 14"/>
    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/>
  </svg>
);
const IconPlay = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────────────────
const features = [
  { icon: <IconMic />, title: 'Transcription intelligente', desc: 'Grâce à Whisper AI, chaque réunion est convertie automatiquement en texte avec une haute précision multilingue.' },
  { icon: <IconUsers />, title: 'Identification des intervenants', desc: 'Pyannote AI détecte et sépare automatiquement les différents locuteurs pour savoir qui parle et à quel moment.' },
  { icon: <IconFile />, title: 'Rapports automatiques', desc: 'Générez des rapports professionnels contenant résumés, décisions, actions et points clés en quelques secondes.' },
  { icon: <IconGlobe />, title: 'Support multilingue', desc: 'La plateforme détecte automatiquement la langue de votre réunion et génère les rapports en français, anglais ou arabe.' },
  { icon: <IconCpu />, title: 'Pipeline IA avancé', desc: 'Chaque réunion passe par une chaîne de traitement intelligente combinant transcription, diarization et génération de contenu.' },
  { icon: <IconHistory />, title: 'Historique et analyse', desc: 'Consultez vos anciennes réunions, recherchez des rapports, gérez vos intervenants et centralisez toutes vos données.' },
];

const steps = [
  { num: '01', label: 'Importez', detail: 'Audio ou vidéo' },
  { num: '02', label: 'Analysez', detail: 'Whisper + Pyannote' },
  { num: '03', label: 'Identifiez', detail: 'Séparation des voix' },
  { num: '04', label: 'Exportez', detail: 'Rapport PDF' },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function LandingPage({ onStart }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0a0c10', color: '#e8eaf0', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #3b82f6; color: #fff;
          border: none; border-radius: 10px;
          padding: 13px 26px; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
          font-family: inherit;
        }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #94a3b8;
          border: 1px solid #1e2a3a; border-radius: 10px;
          padding: 12px 26px; font-size: 15px; font-weight: 400;
          cursor: pointer; transition: border-color 0.2s, color 0.2s;
          font-family: inherit;
        }
        .btn-ghost:hover { border-color: #3b82f6; color: #e8eaf0; }

        .feature-card {
          background: #0f1318; border: 1px solid #1a2233;
          border-radius: 16px; padding: 28px 24px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .feature-card:hover { border-color: #3b82f6; transform: translateY(-3px); }

        .nav-link { color: #64748b; text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .nav-link:hover { color: #e8eaf0; }

        .pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(59,130,246,0.1); color: #60a5fa;
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 500;
        }

        .glow-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .step-line { flex: 1; height: 1px; background: linear-gradient(90deg, #1e3a5f, transparent); }

        .grid-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }

        .hero-badge { animation: fadeDown 0.6s ease both; }
        .hero-title { animation: fadeDown 0.6s 0.1s ease both; }
        .hero-sub { animation: fadeDown 0.6s 0.2s ease both; }
        .hero-desc { animation: fadeDown 0.6s 0.3s ease both; }
        .hero-btns { animation: fadeDown 0.6s 0.4s ease both; }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

        .tagline-strip { overflow: hidden; white-space: nowrap; }
        .tagline-inner { display: inline-block; animation: scroll 20s linear infinite; }
        @keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid #111827', position: 'sticky', top: 0, background: 'rgba(10,12,16,0.9)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#3b82f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconMic />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.3px' }}>PayNote</span>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          <a href="#features" className="nav-link">Fonctionnalités</a>
          <a href="#demo" className="nav-link">Démo</a>
          <a href="#pipeline" className="nav-link">Pipeline</a>
        </div>
        <button className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }} onClick={onStart}>
          Commencer
        </button>
      </nav>

      {/* HERO */}
      <section style={{ padding: '100px 60px 80px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div className="hero-badge" style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <span className="pill"><span className="glow-dot" />Whisper AI · Pyannote · NLP</span>
        </div>
        <h1 className="hero-title" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(38px, 6vw, 68px)', lineHeight: 1.1, letterSpacing: '-1.5px', color: '#fff', marginBottom: 20 }}>
          L'IA au service de<br />
          <span style={{ color: '#3b82f6' }}>vos réunions</span>
        </h1>
        <p className="hero-sub" style={{ fontSize: 18, color: '#94a3b8', fontWeight: 300, maxWidth: 580, margin: '0 auto 14px', lineHeight: 1.6 }}>
          Transformez automatiquement vos réunions audio et vidéo en rapports intelligents grâce à l'intelligence artificielle.
        </p>
        <p className="hero-desc" style={{ fontSize: 14, color: '#475569', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Notre plateforme analyse vos réunions avec Whisper et Pyannote AI pour transcrire les conversations, identifier les intervenants et générer des comptes rendus professionnels en quelques minutes.
        </p>
        <div className="hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={onStart}>
            Commencer maintenant <IconArrow />
          </button>
          <a href="#demo">
            <button className="btn-ghost">
              <IconPlay size={16} /> Voir la démonstration
            </button>
          </a>
        </div>
      </section>

      {/* TAGLINE STRIP */}
      <div className="tagline-strip" style={{ borderTop: '1px solid #111827', borderBottom: '1px solid #111827', padding: '14px 0', background: '#0d1117' }}>
        <div className="tagline-inner" style={{ color: '#334155', fontSize: 13, letterSpacing: '0.05em' }}>
          {[
            'Écoutez moins. Comprenez plus.',
            'Vos réunions. Structurées par l\'intelligence artificielle.',
            'Analysez. Identifiez. Résumez.',
            'L\'intelligence artificielle qui comprend vos réunions.',
            'Écoutez moins. Comprenez plus.',
            'Vos réunions. Structurées par l\'intelligence artificielle.',
            'Analysez. Identifiez. Résumez.',
            'L\'intelligence artificielle qui comprend vos réunions.',
          ].map((t, i) => (
            <span key={i} style={{ marginRight: 64 }}>— {t}</span>
          ))}
        </div>
      </div>

      {/* VIDEO DEMO */}
      <section id="demo" style={{ padding: '80px 60px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 38px)', color: '#fff', marginBottom: 12 }}>
            Découvrez PayNote en action
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Importez un fichier audio ou vidéo, laissez l'IA analyser votre réunion, puis obtenez automatiquement une transcription complète, une séparation des intervenants et un rapport PDF exportable.
          </p>
        </div>

        {/* Video Player */}
        <div style={{ position: 'relative', background: '#0d1117', borderRadius: 20, overflow: 'hidden', border: '1px solid #1a2233', aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            controls={playing}
          >
            {/* Remplacez src par l'URL de votre vidéo */}
            <source src="/demo.mp4" type="video/mp4" />
          </video>

          {/* Play Overlay */}
          {!playing && (
            <div
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,12,16,0.7)', cursor: 'pointer' }}
              onClick={handlePlay}
            >
              {/* Animated rings */}
              <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: -8, border: '1px solid rgba(59,130,246,0.3)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                <div style={{ position: 'absolute', inset: -20, border: '1px solid rgba(59,130,246,0.15)', borderRadius: '50%', animation: 'pulse 2s 0.4s infinite' }} />
                <button
                  style={{ width: 72, height: 72, borderRadius: '50%', background: '#3b82f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'background 0.2s, transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                  aria-label="Lancer la démo"
                >
                  <IconPlay size={26} />
                </button>
              </div>
              <p style={{ marginTop: 20, color: '#64748b', fontSize: 14 }}>Cliquez pour lancer la démonstration</p>
            </div>
          )}
        </div>
      </section>

      {/* PIPELINE STEPS */}
      <section id="pipeline" style={{ padding: '20px 60px 80px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 34px)', color: '#fff', marginBottom: 10 }}>Pipeline IA avancé</h2>
          <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>Chaque réunion passe par une chaîne de traitement intelligente combinant transcription, diarization et génération automatique de contenu.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px 8px', background: '#0f1318', border: '1px solid #1a2233', borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6 }}>{s.num}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#e8eaf0', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: '#475569' }}>{s.detail}</div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a5f', flexShrink: 0 }}>
                  <IconArrow />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '0 60px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 34px)', color: '#fff', marginBottom: 10 }}>
            Des fonctionnalités pensées pour les réunions modernes
          </h2>
        </div>
        <div className="grid-features">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ width: 44, height: 44, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: 16 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e8eaf0', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '60px 60px 80px', textAlign: 'center', borderTop: '1px solid #111827' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 42px)', color: '#fff', marginBottom: 12 }}>
          Automatisez vos réunions dès aujourd'hui
        </h2>
        <p style={{ color: '#64748b', fontSize: 15, maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Gagnez du temps, améliorez votre organisation et laissez l'intelligence artificielle gérer vos comptes rendus.
        </p>
        <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 16 }} onClick={onStart}>
          Lancer une analyse <IconArrow />
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px 60px', borderTop: '1px solid #0d1117', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: '#3b82f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconMic />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff' }}>PayNote</span>
        </div>
        <p style={{ fontSize: 12, color: '#334155' }}>Intelligent Meeting Assistant powered by AI.</p>
      </footer>
    </div>
  );
}