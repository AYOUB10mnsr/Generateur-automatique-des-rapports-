import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, MessageSquareText, Send } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Input, Page, Select } from "../components/common/ui";
import { useReports } from "../hooks/useReports";
import {
  createConversation,
  getConversationMessages,
  listReportConversations,
  ragQuery,
} from "../services/api";
import { formatDate } from "../utils";

export default function AiSearchPage() {
  const { reports, loading: reportsLoading } = useReports();
  const [selectedReportId, setSelectedReportId] = useState("");
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState("");
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);

  const completedReports = useMemo(() => (reports || []).filter((r) => r.status === "completed"), [reports]);
  const reportStorageKey = "ai_selected_report_id";
  const convStoragePrefix = "ai_selected_conversation_";

  useEffect(() => {
    if (completedReports.length === 0) return;
    const remembered = localStorage.getItem(reportStorageKey);
    if (!selectedReportId) {
      const fallback =
        remembered && completedReports.some((r) => String(r.id) === remembered)
          ? remembered
          : String(completedReports[0].id);
      setSelectedReportId(fallback);
    }
  }, [completedReports, selectedReportId]);

  useEffect(() => {
    localStorage.setItem(reportStorageKey, selectedReportId || "");
  }, [selectedReportId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const loadMessages = async (convId) => {
    if (!convId) {
      setMessages([]);
      return;
    }
    const rows = await getConversationMessages(Number(convId));
    setMessages(Array.isArray(rows) ? rows : []);
  };

  const loadConversations = async (reportId) => {
    if (!reportId) {
      setConversations([]);
      setConversationId("");
      setMessages([]);
      return;
    }
    const rows = await listReportConversations(Number(reportId));
    const list = Array.isArray(rows) ? rows : [];
    setConversations(list);

    const remembered = localStorage.getItem(`${convStoragePrefix}${reportId}`);
    const selected =
      (remembered && list.some((x) => String(x.id) === remembered) && remembered) ||
      (list[0] ? String(list[0].id) : "");
    setConversationId(selected);
    await loadMessages(selected);
  };

  useEffect(() => {
    if (!selectedReportId) return;
    loadConversations(selectedReportId).catch((e) => {
      toast.error(e?.message || "Impossible de charger les conversations");
    });
  }, [selectedReportId]);

  useEffect(() => {
    if (!selectedReportId) return;
    localStorage.setItem(`${convStoragePrefix}${selectedReportId}`, conversationId || "");
  }, [selectedReportId, conversationId]);

  const ensureConversation = async () => {
    if (conversationId) return conversationId;
    const created = await createConversation({ report_id: Number(selectedReportId) });
    const id = String(created?.conversation_id || "");
    if (!id) throw new Error("Creation conversation failed");
    await loadConversations(selectedReportId);
    return id;
  };

  const startNewConversation = async () => {
    if (!selectedReportId) return;
    try {
      const created = await createConversation({ report_id: Number(selectedReportId) });
      const id = String(created?.conversation_id || "");
      await loadConversations(selectedReportId);
      if (id) {
        setConversationId(id);
        await loadMessages(id);
      }
    } catch (e) {
      toast.error(e?.message || "Impossible de creer la conversation");
    }
  };

  const onSubmit = async () => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      toast.error("Veuillez saisir une question.");
      return;
    }
    if (!selectedReportId) {
      toast.error("Veuillez selectionner un rapport.");
      return;
    }

    try {
      const currentConversationId = await ensureConversation();
      setMessages((prev) => [...prev, { role: "user", content: cleanQuestion }]);
      setQuestion("");
      setSending(true);
      await ragQuery({
        report_id: Number(selectedReportId),
        question: cleanQuestion,
        top_k: 8,
        conversation_id: Number(currentConversationId),
      });
      await loadMessages(currentConversationId);
      await loadConversations(selectedReportId);
    } catch (e) {
      toast.error(e?.message || "Echec de la requete IA");
    } finally {
      setSending(false);
    }
  };

  return (
    <Page>
      <Card className="border border-[#5DD62C]/30 bg-[#080808]">
        <div className="flex items-center gap-2">
          <MessageSquareText size={20} className="text-[#5DD62C]" />
          <h1 className="font-display text-2xl text-white">Assistant IA Reunion</h1>
        </div>
        <p className="mt-2 text-sm text-gray-400">Selectionnez une reunion puis discutez avec l'assistant IA.</p>
        <div className="mt-4">
          <Select
            value={selectedReportId}
            onChange={(e) => setSelectedReportId(e.target.value)}
            disabled={reportsLoading || completedReports.length === 0}
            className="border-[#5DD62C]/30 bg-black/60 text-white"
          >
            {completedReports.length === 0 && <option value="">Aucun rapport disponible</option>}
            {completedReports.map((r) => (
              <option key={r.id} value={r.id}>
                Reunion #{r.id} - {r.report_language || "unknown"} - {r.speaker_count || 0} speakers - {formatDate(r.created_at)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="border border-[#5DD62C]/30 bg-[#050505]">
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <div className="rounded-xl border border-[#5DD62C]/20 bg-black/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-gray-300">Historique</p>
              <Button variant="ghost" className="h-8 px-2 text-xs" onClick={startNewConversation}>
                Nouvelle
              </Button>
            </div>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setConversationId(String(conv.id));
                    loadMessages(String(conv.id)).catch(() => toast.error("Chargement impossible"));
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    String(conv.id) === String(conversationId)
                      ? "border-[#5DD62C] bg-[#12210b] text-white"
                      : "border-[#5DD62C]/20 bg-black/20 text-gray-300"
                  }`}
                >
                  Conversation #{conv.id}
                </button>
              ))}
              {conversations.length === 0 && <p className="text-xs text-gray-400">Aucune conversation sauvegardee.</p>}
            </div>
          </div>

          <div>
            <div ref={listRef} className="max-h-[520px] space-y-3 overflow-auto rounded-xl border border-[#5DD62C]/20 bg-black/40 p-4">
              {messages.length === 0 && (
                <div className="rounded-xl border border-[#5DD62C]/20 bg-[#101010] p-4 text-sm text-gray-300">
                  Selectionnez ou creez une conversation, puis posez une question.
                </div>
              )}
              {messages.map((m, idx) => (
                <div key={`${m.role}-${idx}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      m.role === "user" ? "bg-[#5DD62C] text-black" : "border border-[#5DD62C]/30 bg-[#101010] text-gray-100"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                      {m.role === "assistant" ? <Bot size={13} /> : null}
                      <span>{m.role === "user" ? "Vous" : "Assistant IA"}</span>
                    </div>
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-[#5DD62C]/30 bg-[#101010] px-4 py-3 text-sm text-gray-100">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-[#5DD62C]" />
                      <span>Analyse en cours...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Posez une question sur cette reunion..."
            className="border-[#5DD62C]/30 bg-black/60 text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!sending) onSubmit();
              }
            }}
          />
          <Button onClick={onSubmit} disabled={sending} className="bg-[#5DD62C] text-black hover:bg-[#72ff39]">
            <Send size={15} />
            Envoyer
          </Button>
        </div>
      </Card>
    </Page>
  );
}
