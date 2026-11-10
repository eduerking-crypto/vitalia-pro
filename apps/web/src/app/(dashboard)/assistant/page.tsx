"use client";

import { useState } from "react";
import { Bot, MessageSquare, Send, Trash2 } from "lucide-react";
import { AGENTS_INFO } from "@/lib/constants";
import { useChat } from "@/hooks/use-chat";
import { ChatContainer } from "@/components/assistant/chat-container";
import { Card, EmptyState, CardHeader } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AssistantPage() {
  const [openSidebar, setOpenSidebar] = useState(true);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Asistente de salud IA</h1>
          <p className="text-sm text-secondary">
            Consulta a los agentes especializados: biología, nutrición y seguridad.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpenSidebar((v) => !v)}
          aria-label="Mostrar u ocultar guía de agentes"
        >
          {openSidebar ? "Ocultar guía" : "Mostrar guía"}
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {openSidebar && (
          <aside className="lg:block hidden">
            <AgentsGuide />
          </aside>
        )}
        <main className="min-h-[500px] flex flex-col">
          <ChatContainer />
        </main>
      </div>

      <AlertInfo />
    </div>
  );
}

function AgentsGuide() {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <h2 className="text-sm font-semibold">Agentes especializados</h2>
        <p className="text-xs text-secondary">Elige de quién quieres consultar.</p>
      </CardHeader>
      <div className="space-y-3">
        {AGENTS_INFO.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center gap-3 rounded-lg border border-[color:var(--color-border)] bg-white p-3 text-left cursor-pointer hover:bg-sage-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sage-100 text-sage-600 dark:bg-neutral-800 dark:text-sage-300">
              <Bot className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{agent.name}</p>
              <p className="text-xs text-secondary truncate">{agent.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AlertInfo() {
  return (
    <Card className="border-l-4 border-l-info">
      <div className="flex items-start gap-3 p-4">
        <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Información orientativa</p>
          <p className="mt-0.5 text-xs text-secondary">
            Las respuestas del asistente no sustituyen el diagnóstico o tratamiento
            de un profesional sanitario. En caso de urgencia, llama al 112.
          </p>
        </div>
      </div>
    </Card>
  );
}
