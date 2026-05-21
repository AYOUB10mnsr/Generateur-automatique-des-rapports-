import PptxGenJS from "pptxgenjs";
import path from "node:path";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Projet Academique IA";
pptx.subject = "Soutenance plateforme IA";
pptx.title = "Plateforme IA de generation automatique de rapports de reunions";
pptx.company = "Academic Project";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "fr-FR",
};

const C = {
  bg: "0A0F0D",
  neon: "39FF88",
  white: "FFFFFF",
  soft: "CFE9D8",
  accent: "1D2A23"
};

function baseSlide(title, subtitle="") {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:13.33, h:0.18, fill:{color:C.neon}, line:{color:C.neon} });
  s.addText(title, { x:0.6, y:0.35, w:12.1, h:0.6, fontFace:"Aptos Display", fontSize:30, bold:true, color:C.white });
  if (subtitle) s.addText(subtitle, { x:0.6, y:1.0, w:12.1, h:0.35, fontSize:14, color:C.neon, italic:true });
  return s;
}

function bullets(slide, items) {
  let y = 1.6;
  for (const t of items) {
    slide.addText(`• ${t}`, { x:0.9, y, w:11.8, h:0.42, fontSize:18, color:C.soft });
    y += 0.5;
  }
}

let s = baseSlide("Plateforme IA de Rapports de Reunions", "Soutenance technique - 10 minutes");
bullets(s, [
  "Pipeline complet: audio/video -> transcription -> diarization -> identification -> resume",
  "Assistant conversationnel IA par reunion avec RAG contextuel",
  "Objectif: automatiser, fiabiliser et accelerer l analyse des reunions professionnelles"
]);

s = baseSlide("Problematique", "Pourquoi ce projet est necessaire");
bullets(s, [
  "Les reunions produisent beaucoup d information non structuree et difficile a exploiter",
  "Les comptes-rendus manuels sont lents, subjectifs et incomplets",
  "Les decisions et actions peuvent etre perdues sans un systeme intelligent",
  "Besoin d un assistant IA robuste, explicable et disponible meme en cas de panne LLM"
]);

s = baseSlide("Architecture Globale", "Vue systeme Fullstack IA");
s.addShape(pptx.ShapeType.roundRect, {x:0.9,y:1.7,w:2.1,h:0.9,fill:{color:"112119"},line:{color:C.neon}});
s.addText("React UI", {x:1.35,y:2.0,w:1.4,h:0.3,color:C.white,bold:true,align:"center"});
s.addShape(pptx.ShapeType.chevron, {x:3.2,y:1.95,w:0.7,h:0.35,fill:{color:C.neon},line:{color:C.neon}});
s.addShape(pptx.ShapeType.roundRect, {x:4.2,y:1.7,w:2.4,h:0.9,fill:{color:"112119"},line:{color:C.neon}});
s.addText("FastAPI Backend", {x:4.55,y:2.0,w:1.7,h:0.3,color:C.white,bold:true,align:"center"});
s.addShape(pptx.ShapeType.chevron, {x:6.9,y:1.95,w:0.7,h:0.35,fill:{color:C.neon},line:{color:C.neon}});
s.addShape(pptx.ShapeType.roundRect, {x:7.9,y:1.4,w:4.2,h:1.5,fill:{color:"112119"},line:{color:C.neon}});
s.addText("Whisper + Pyannote + Speaker ID\nGroq / Ollama\nRAG MiniLM + ChromaDB", {x:8.2,y:1.7,w:3.6,h:1.0,color:C.white,align:"center",fontSize:14});
s.addShape(pptx.ShapeType.roundRect, {x:1.2,y:3.6,w:3.5,h:1.1,fill:{color:"112119"},line:{color:C.neon}});
s.addText("SQLite (app.db)\nReports / Segments / Conversations", {x:1.4,y:3.95,w:3.1,h:0.8,color:C.white,align:"center",fontSize:13});
s.addShape(pptx.ShapeType.roundRect, {x:5.2,y:3.6,w:6.9,h:1.1,fill:{color:"112119"},line:{color:C.neon}});
s.addText("Outputs: Resume, Rapport PDF, Chat IA contextuel par reunion", {x:5.5,y:4.0,w:6.2,h:0.5,color:C.white,align:"center",fontSize:14});

s = baseSlide("Pipeline IA Detaille", "Du media brut a la connaissance exploitable");
bullets(s, [
  "1) Ingestion media (fichier local ou source externe)",
  "2) Whisper: transcription temporelle segmentee",
  "3) Pyannote: diarization multi-speakers",
  "4) Speaker Identification: mapping segments vers speakers connus",
  "5) LLM (Groq): generation du resume, fallback Ollama si indisponible",
  "6) Indexation RAG: embeddings MiniLM + stockage ChromaDB",
  "7) Assistant IA: Q/R contextuelles sur une reunion specifique"
]);

s = baseSlide("Workflow Systeme", "Chaîne operationnelle de bout en bout");
const nodes = ["User Upload","FastAPI","Whisper","Pyannote","Speaker ID","LLM","RAG","Report","Chat UI"];
let x = 0.55;
for (let i=0;i<nodes.length;i++) {
  s.addShape(pptx.ShapeType.roundRect, {x, y:2.4, w:1.25, h:0.8, fill:{color:"112119"}, line:{color:C.neon}});
  s.addText(nodes[i], {x:x+0.05,y:2.67,w:1.15,h:0.3,fontSize:11,align:"center",color:C.white,bold:true});
  if (i < nodes.length-1) s.addShape(pptx.ShapeType.chevron, {x:x+1.27,y:2.63,w:0.35,h:0.35,fill:{color:C.neon},line:{color:C.neon}});
  x += 1.45;
}
s.addText("Flux principal: Upload -> Traitement IA -> Generation rapport -> Interaction conversationnelle", {x:0.8,y:3.7,w:12,h:0.4,fontSize:14,color:C.soft,italic:true});

s = baseSlide("Technologies Utilisees", "Stack technique du projet");
s.addShape(pptx.ShapeType.roundRect, {x:0.9,y:1.7,w:3.8,h:3.8,fill:{color:"112119"},line:{color:C.neon}});
s.addText("Backend", {x:1.15,y:1.95,w:3.3,h:0.3,color:C.neon,bold:true,fontSize:18});
bullets(s,["FastAPI","SQLite + SQLAlchemy","Groq API + Ollama fallback"].map(x=>x));
s.addShape(pptx.ShapeType.roundRect, {x:4.9,y:1.7,w:3.8,h:3.8,fill:{color:"112119"},line:{color:C.neon}});
s.addText("IA/NLP", {x:5.15,y:1.95,w:3.3,h:0.3,color:C.neon,bold:true,fontSize:18});
s.addText("• Whisper\n• Pyannote\n• SentenceTransformers MiniLM\n• ChromaDB", {x:5.2,y:2.35,w:3.2,h:2.5,color:C.soft,fontSize:16,breakLine:true});
s.addShape(pptx.ShapeType.roundRect, {x:8.9,y:1.7,w:3.8,h:3.8,fill:{color:"112119"},line:{color:C.neon}});
s.addText("Frontend", {x:9.15,y:1.95,w:3.3,h:0.3,color:C.neon,bold:true,fontSize:18});
s.addText("• React\n• Axios\n• UI Chat style SaaS", {x:9.2,y:2.35,w:3.2,h:2.5,color:C.soft,fontSize:16,breakLine:true});

s = baseSlide("RAG System Explanation", "Contextual Retrieval par reunion");
bullets(s, [
  "Indexation: segments speakers + resume + transcription + decisions detectees",
  "Embeddings: all-MiniLM-L6-v2 pour recherche semantique rapide sur CPU",
  "Filtrage strict par report_id pour eviter les fuites inter-reunions",
  "Routing intelligent: questions globales -> SQL, questions reunion -> RAG",
  "Sortie utilisateur: reponse naturelle, sans exposition des chunks internes"
]);

s = baseSlide("High Availability", "Groq -> Ollama fallback");
s.addShape(pptx.ShapeType.roundRect, {x:1.4,y:2.0,w:4.4,h:1.5,fill:{color:"11311F"},line:{color:C.neon}});
s.addText("Primary LLM\nGroq", {x:2.1,y:2.45,w:3.0,h:0.8,align:"center",bold:true,color:C.white,fontSize:22});
s.addShape(pptx.ShapeType.chevron,{x:6.1,y:2.55,w:1.0,h:0.5,fill:{color:C.neon},line:{color:C.neon}});
s.addShape(pptx.ShapeType.roundRect, {x:7.4,y:2.0,w:4.4,h:1.5,fill:{color:"2A1A1A"},line:{color:"FF8A80"}});
s.addText("Fallback LLM\nOllama (Phi3 mini)", {x:7.8,y:2.45,w:3.6,h:0.8,align:"center",bold:true,color:C.white,fontSize:18});
s.addText("Si Groq est indisponible, le systeme bascule automatiquement vers Ollama pour garantir la continuite de service.", {x:1.1,y:4.1,w:11.6,h:0.8,color:C.soft,fontSize:15,align:"center"});

s = baseSlide("Demonstration UI", "Experience utilisateur");
bullets(s, [
  "Upload media et suivi du pipeline en temps reel",
  "Page details rapport avec transcription speaker-aware",
  "Chat IA contextuel: questions sur la reunion selectionnee",
  "Historique des conversations persistant dans SQLite",
  "Interface sombre, lisible et orientee productivite"
]);

s = baseSlide("Diagramme PERT du Projet", "Planification et dependances");
const pert = [
  {name:"Analyse",x:0.9,y:2.7},{name:"Backend",x:2.7,y:1.9},{name:"AI Models\nIntegration",x:4.6,y:2.7},
  {name:"RAG System",x:6.7,y:1.9},{name:"Frontend",x:8.6,y:2.7},{name:"Testing",x:10.3,y:1.9},{name:"Deployment",x:11.5,y:2.7}
];
for (const n of pert){s.addShape(pptx.ShapeType.ellipse,{x:n.x,y:n.y,w:1.5,h:0.9,fill:{color:"112119"},line:{color:C.neon}});s.addText(n.name,{x:n.x+0.05,y:n.y+0.24,w:1.4,h:0.45,align:"center",fontSize:11,color:C.white,bold:true});}
function arrow(x,y,w){s.addShape(pptx.ShapeType.chevron,{x,y,w,h:0.25,fill:{color:C.neon},line:{color:C.neon}})}
arrow(2.35,2.98,0.35); arrow(4.2,2.33,0.35); arrow(6.3,2.33,0.35); arrow(8.25,2.98,0.35); arrow(9.95,2.33,0.35); arrow(11.15,2.33,0.35);
s.addText("Dependances: Analyse -> Backend -> AI Models -> RAG -> Frontend -> Testing -> Deployment", {x:0.9,y:4.2,w:12,h:0.5,fontSize:14,color:C.soft});

s = baseSlide("Difficultes et Solutions", "Retour d experience ingenierie IA");
bullets(s, [
  "Qualite audio variable -> pretraitement + robustesse Whisper",
  "Attribution speakers complexe -> ajustement diarization + identification",
  "Latence LLM distante -> fallback local Ollama",
  "Reponses RAG faibles au debut -> enrichissement contexte + retrieval filtre",
  "Persistance conversationnelle -> stockage SQLite conversations/messages"
]);

s = baseSlide("Conclusion", "Assistant IA de reunion pret pour evolution SaaS");
bullets(s, [
  "Plateforme complete: traitement, resume, retrieval et conversation IA",
  "Architecture modulaire, fiable et orientee disponibilite",
  "Base solide pour extensions: analytics avancees, multi-langue, monitoring",
  "Resultat: gain de temps, meilleure tracabilite des decisions, usage professionnel"
]);
s.addText("Merci - Questions ?", {x:0.6,y:5.9,w:12,h:0.5,fontFace:"Aptos Display",fontSize:28,bold:true,color:C.neon,align:"center"});

const out = path.resolve("C:/Users/ouaabou/Desktop/projet_Ai/Generateur-automatique-des-rapports-/front_end/meeting-report-app/presentation_soutenance_ia_reunions.pptx");
await pptx.writeFile({ fileName: out });
console.log(out);
