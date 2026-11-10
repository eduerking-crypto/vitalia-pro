"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "@/components/assistant/chat-message";
import { TypingIndicator } from "@/components/assistant/typing-indicator";
import { ChatInput } from "@/components/assistant/chat-input";
import { EmptyState } from "@/components/ui";
import { MessageSquare } from "lucide-react";
import { formatTimeHM } from "@/lib/utils";

const QUICK_QUESTIONS = [
  "¿Cómo ha sido mi sueño esta semana?",
  "¿Qué debo cenar hoy?",
  "¿Puedo tomar ibuprofeno con warfarina?",
  "¿Cuál es mi puntuación de salud?",
  "¿Cómo interpretar mi glucosa en ayunas?",
];

export function ChatContainer() {
  const { messages, isTyping, lastAgent, lastReasoning, send, clear } = useChat();
  const [input, setInput] = useState("");

  const handleSend = (text: string) => {
    setInput("");
    send(text);
  };

  return (
    <div className="flex h-[calc(100vh-16rem)] flex-col">
      {/* Encabezado del chat */}
      <div className="border-b border-[color:var(--color-border)] px-4 py-3 bg-[color:var(--color-surface)]">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-600 dark:bg-neutral-800 dark:text-sage-300">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">Asistente de salud</p>
            <p className="text-xs text-secondary">
              {lastAgent ? `Último agente: ${agentName(lastAgent)}` : "Inicia una conversación"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={clear}
          className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-sage-50 dark:hover:bg-neutral-800"
          aria-label="Limpiar conversación"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Preguntas rápidas (solo si vacío) */}
      {messages.length === 0 && !isTyping && (
        <div className="p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Sugerencias</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm text-left text-secondary hover:bg-sage-50 hover:text-ink dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors"
              >
                <Send className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isTyping && (
          <EmptyState
            icon={MessageSquare}
            title="Sin conversación todavía"
            description="Pregunta lo que quieras sobre tu salud, sueño, nutrición o medicación."
            className="py-6"
          />
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Entrada */}
      <div className="border-t border-[color:var(--color-border)] px-4 py-3 bg-[color:var(--color-surface)]">
        <ChatInput value={input} onChange={setInput} onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
}

function agentName(id: string): string {
  const map: Record<string, string> = {
    biology: "Agente Biología",
    nutrition: "Agente Nutrición",
    security: "Agente Seguridad",
    general: "Asistente general",
  };
  return map[id] ?? id;
}
