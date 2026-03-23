"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { api, type ChatMessage } from "@/lib/api";

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Bonjour 👋 Je suis **CompressBot**, ton assistant spécialisé en compression de données.\n\nTu peux me poser des questions sur :\n• L'algorithme de **Huffman**\n• L'algorithme **LZW**\n• L'**entropie de Shannon**\n• La compression sans perte vs avec perte\n• Les ratios de compression et leur interprétation\n\nQu'est-ce que tu veux comprendre ?",
};

const SUGGESTIONS = [
  "Comment fonctionne Huffman ?",
  "Explique-moi LZW simplement",
  "C'est quoi l'entropie de Shannon ?",
  "Quelle différence entre compression avec et sans perte ?",
];

function renderContent(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function MessageBubble({
  msg,
  index,
}: {
  msg: ChatMessage;
  index: number;
}) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full shadow-md
          ${isUser ? "bg-purple-500" : "bg-blue-500"}`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[86%] rounded-3xl px-3 py-2.5 text-[13px] leading-relaxed shadow-lg whitespace-pre-wrap sm:max-w-[78%] sm:px-4 sm:py-3 sm:text-sm
          ${
            isUser
              ? "rounded-br-sm bg-purple-600/80 text-white"
              : "rounded-bl-sm border border-white/10 bg-white/10 text-white backdrop-blur-md"
          }`}
      >
        {renderContent(msg.content)}
      </div>
    </motion.div>
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (content: string) => {
    const text = content.trim();
    if (!text || loading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const { reply } = await api.chat(newMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Assistant unavailable:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Je suis temporairement indisponible, mais je reviens vite. Réessaie dans quelques instants 🙏",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden text-white">
      {/* ── HEADER ── */}
      <div className="shrink-0 border-b border-white/10 bg-white/5 px-3 py-3 backdrop-blur-md sm:px-8 sm:py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:h-10 sm:w-10">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold sm:text-xl">CompressBot</h1>
            <p className="text-[11px] text-white/50 sm:text-xs">
              Assistant IA · Compression de données
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-8 sm:py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} index={i} />
          ))}

          {/* Loading indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-end gap-2"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 shadow-md">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-2 rounded-3xl rounded-bl-sm border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <Loader2 size={16} className="animate-spin text-blue-300" />
                  <span className="text-sm text-white/60">
                    CompressBot réfléchit…
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <p className="text-center text-xs text-red-400">{error}</p>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── SUGGESTIONS (visible seulement au début) ── */}
      {messages.length <= 1 && (
        <div className="shrink-0 px-3 pb-2 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <p className="mb-2 text-xs text-white/40">Suggestions rapides</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="shrink-0 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INPUT ── */}
      <div className="shrink-0 border-t border-white/10 bg-white/5 px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-md sm:px-8 sm:py-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2 sm:gap-3">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose ta question sur la compression…"
            className="flex-1 resize-none rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 text-base text-white placeholder-white/40 backdrop-blur-md transition focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 sm:px-4 sm:py-3 sm:text-sm"
            style={{ maxHeight: "120px" }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
            aria-label="Envoyer"
          >
            <Send size={16} className="sm:h-[18px] sm:w-[18px]" />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] text-white/25 sm:text-[11px]">
          Entrée pour envoyer · Shift+Entrée pour un saut de ligne
        </p>
      </div>
    </div>
  );
}
