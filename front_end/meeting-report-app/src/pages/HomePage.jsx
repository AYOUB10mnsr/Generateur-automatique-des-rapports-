import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Users, 
  FileText, 
  Globe, 
  ArrowRight, 
  Play, 
  Zap,
  ChevronRight
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-[#5DD62C] selection:text-black -mx-6 -my-6">
      
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: 'linear-gradient(#5DD62C 1px, transparent 1px), linear-gradient(90deg, #5DD62C 1px, transparent 1px)',
               backgroundSize: '60px 60px'
             }}>
        </div>
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-[#5DD62C] rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#5DD62C] rounded-full blur-[150px] opacity-5"></div>

        <motion.div 
          className="relative z-10 max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#5DD62C]/30 bg-[#5DD62C]/5 text-[#5DD62C] text-sm font-mono tracking-wide">
              <Zap size={14} />
              AI-Powered Meeting Intelligence
            </span>
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            L'IA au service de{' '}
            <span className="text-[#5DD62C]">vos réunions</span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed"
          >
            Transformez automatiquement vos réunions audio et vidéo en rapports intelligents grâce à l'intelligence artificielle.
          </motion.p>

          <motion.p 
            variants={fadeInUp}
            className="text-gray-500 max-w-2xl mx-auto mb-12 text-base leading-relaxed"
          >
            Notre plateforme analyse vos réunions avec Whisper et Pyannote AI pour transcrire les conversations, identifier les intervenants et générer des comptes rendus professionnels en quelques minutes.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative px-8 py-4 bg-[#5DD62C] text-black font-semibold rounded-lg hover:bg-[#4ec124] transition-all duration-300 flex items-center gap-2 text-lg"
            >
              Commencer maintenant
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-8 py-4 border border-gray-700 text-white font-medium rounded-lg hover:border-[#5DD62C] hover:text-[#5DD62C] transition-all duration-300 flex items-center gap-2 text-lg bg-transparent"
            >
              <Play size={20} />
              Voir la démonstration
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-gray-700 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-[#5DD62C] rounded-full"></div>
          </div>
        </motion.div>
      </section>

     {/* VIDEO DEMO */}
        <section id="demo-section" className="py-24 px-6 border-t border-gray-800/50">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* TEXTE D'INTRODUCTION */}
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                Découvrez <span className="text-[#5DD62C]">PayNote</span> en action
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Importez un fichier audio ou vidéo, laissez l'intelligence artificielle analyser votre réunion, 
                puis obtenez automatiquement une transcription complète, une séparation des intervenants 
                et un rapport professionnel exportable en PDF.
              </p>
            </motion.div>

            {/* LECTEUR VIDÉO */}
            <motion.div 
              variants={scaleIn}
              className="relative aspect-video max-w-5xl mx-auto rounded-xl overflow-hidden border border-gray-800 bg-[#0f0f0f] group"
            >
              {/* La Vidéo Réelle */}
              <video 
                controls 
                className="w-full h-full object-cover shadow-2xl"
                poster="/images/video-poster.jpg" // Optionnel : une image avant de cliquer
              >
                <source src="/demo.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>

              {/* LES COINS STYLISÉS (UI Cyber) */}
              <div className="pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#5DD62C] rounded-tl-lg shadow-[0_0_10px_rgba(93,214,44,0.3)]"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#5DD62C] rounded-tr-lg shadow-[0_0_10px_rgba(93,214,44,0.3)]"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#5DD62C] rounded-bl-lg shadow-[0_0_10px_rgba(93,214,44,0.3)]"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#5DD62C] rounded-br-lg shadow-[0_0_10px_rgba(93,214,44,0.3)]"></div>
              </div>
            </motion.div>

            {/* PETITE NOTE D'ANALYSE (Contenu texte supplémentaire) */}
            <motion.div variants={fadeInUp} className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#5DD62C]/20 bg-[#5DD62C]/5">
                <div className="w-2 h-2 rounded-full bg-[#5DD62C] animate-ping" />
                <p className="text-sm text-[#5DD62C] font-mono">
                  Pipeline IA actif : 98% de précision sur la séparation des locuteurs
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

      {/* FEATURES */}
      <section className="py-24 px-6 border-t border-gray-800/50">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Des fonctionnalités pensées pour les{' '}
              <span className="text-[#5DD62C]">réunions modernes</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="group p-8 rounded-xl border border-gray-800 bg-[#141414] hover:border-[#5DD62C]/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-[#5DD62C]/10 flex items-center justify-center mb-6 group-hover:bg-[#5DD62C]/20 transition-colors">
                <Mic className="text-[#5DD62C]" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-[#5DD62C] transition-colors">Transcription intelligente</h3>
              <p className="text-gray-400 leading-relaxed">
                Grâce à Whisper AI, chaque réunion est convertie automatiquement en texte avec une haute précision multilingue.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="group p-8 rounded-xl border border-gray-800 bg-[#141414] hover:border-[#5DD62C]/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-[#5DD62C]/10 flex items-center justify-center mb-6 group-hover:bg-[#5DD62C]/20 transition-colors">
                <Users className="text-[#5DD62C]" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-[#5DD62C] transition-colors">Identification des intervenants</h3>
              <p className="text-gray-400 leading-relaxed">
                Pyannote AI détecte et sépare automatiquement les différents locuteurs pour savoir qui parle et à quel moment.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="group p-8 rounded-xl border border-gray-800 bg-[#141414] hover:border-[#5DD62C]/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-[#5DD62C]/10 flex items-center justify-center mb-6 group-hover:bg-[#5DD62C]/20 transition-colors">
                <FileText className="text-[#5DD62C]" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-[#5DD62C] transition-colors">Rapports automatiques</h3>
              <p className="text-gray-400 leading-relaxed">
                Générez des rapports professionnels contenant résumés, décisions, actions et points clés en quelques secondes.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* MULTILINGUAL */}
      <section className="py-24 px-6 border-t border-gray-800/50">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="w-16 h-16 rounded-full bg-[#5DD62C]/10 flex items-center justify-center mx-auto mb-6">
              <Globe className="text-[#5DD62C]" size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Support <span className="text-[#5DD62C]">multilingue</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              La plateforme détecte automatiquement la langue de votre réunion et peut générer les rapports en français, anglais ou arabe.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 mt-12">
            {['Français', 'English', 'العربية'].map((lang) => (
              <div 
                key={lang}
                className="px-6 py-3 rounded-lg border border-gray-700 bg-[#141414] text-gray-300 font-mono text-sm hover:border-[#5DD62C] hover:text-[#5DD62C] transition-all duration-300 cursor-default"
              >
                {lang}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 border-t border-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#5DD62C]/5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#5DD62C] rounded-full blur-[200px] opacity-10"></div>
        
        <motion.div 
          className="relative z-10 max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold mb-6">
            Automatisez vos réunions{' '}
            <span className="text-[#5DD62C]">dès aujourd'hui</span>
          </motion.h2>
          
          <motion.p variants={fadeInUp} className="text-gray-400 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Gagnez du temps, améliorez votre organisation et laissez l'intelligence artificielle gérer vos comptes rendus.
          </motion.p>
          
          <motion.div variants={fadeInUp}>
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative px-10 py-5 bg-[#5DD62C] text-black font-bold rounded-lg hover:bg-[#4ec124] transition-all duration-300 flex items-center gap-3 text-xl mx-auto"
            >
              Lancer une analyse
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </section>
 </div>
  );
};

export default HomePage;