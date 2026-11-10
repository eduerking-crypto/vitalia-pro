import type { UUID } from "./index";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: UUID;
  user_id: UUID;
  role: ChatRole;
  content: string;
  agent: AssistantAgent | null;
  created_at: string; // ISO datetime
}

export type AssistantAgent = "biology" | "nutrition" | "security" | "general";

export interface ChatRequest {
  message: string;
  conversation_id?: UUID;
}

export interface ChatResponse {
  message: ChatMessage;
  agent_used: AssistantAgent;
  agent_reasoning: string;
  disclaimers: string[];
}

export interface AgentInfo {
  id: AssistantAgent;
  name: string;
  description: string;
  capabilities: string[];
}
