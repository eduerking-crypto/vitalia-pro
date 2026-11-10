"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatResponse } from "@vitalia/shared-types";
import { clearChatHistory, fetchChatHistory, sendChatMessage } from "@/lib/api/assistant";
import { toast } from "@/stores/use-notification-store";
import { apiErrorMessage } from "@/lib/utils";

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  lastAgent: ChatResponse["agent_used"] | null;
  lastReasoning: string | null;
}

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    lastAgent: null,
    lastReasoning: null,
  });
  const historyLoaded = useRef(false);

  useEffect(() => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;
    fetchChatHistory()
      .then((messages) => setState((s) => ({ ...s, messages })))
      .catch(() => undefined);
  }, []);

  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content) return;

    const userMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      user_id: "me",
      role: "user",
      content,
      agent: null,
      created_at: new Date().toISOString(),
    };

    setState((s) => ({ ...s, messages: [...s.messages, userMessage], isTyping: true }));

    try {
      const response = await sendChatMessage(content);
      setState((s) => ({
        ...s,
        messages: [...s.messages, response.message],
        isTyping: false,
        lastAgent: response.agent_used,
        lastReasoning: response.agent_reasoning,
      }));
      return response;
    } catch (error) {
      setState((s) => ({ ...s, isTyping: false }));
      toast.error("El asistente no responde", apiErrorMessage(error));
      return null;
    }
  }, []);

  const clear = useCallback(async () => {
    try {
      await clearChatHistory();
      setState({ messages: [], isTyping: false, lastAgent: null, lastReasoning: null });
      toast.success("Conversación limpiada");
    } catch (error) {
      toast.error("No se pudo limpiar el historial", apiErrorMessage(error));
    }
  }, []);

  return { ...state, send, clear };
}
