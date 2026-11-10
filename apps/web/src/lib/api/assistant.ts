import type { ChatMessage, ChatResponse } from "@vitalia/shared-types";
import { api } from "./client";

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/assistant/chat", { message });
  return data;
}

export async function fetchChatHistory(): Promise<ChatMessage[]> {
  const { data } = await api.get<ChatMessage[]>("/assistant/history");
  return data;
}

export async function clearChatHistory(): Promise<void> {
  await api.delete("/assistant/history");
}
