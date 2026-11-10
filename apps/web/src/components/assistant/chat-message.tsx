"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { formatTimeHM } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full max-w-[85%] md:max-w-[70%] ${isUser ? "ml-auto" : "mr-auto"}`}>
      <div
        className={
          "rounded-2xl px-4 py-3 text-sm break-words shadow-soft" +
          (isUser
            ? " rounded-tr-none bg-sage-100 text-ink dark:bg-neutral-800 dark:text-neutral-100"
            : " rounded-tl-none bg-white text-ink dark:bg-neutral-900 dark:text-neutral-100 border border-[color:var(--color-border)]")
        }
      >
        {message.content}
      </div>
      {!isUser && message.agent && (
        <div className="flex items-center gap-1.5 mt-1">
          <Badge variant="serene">{message.agent}</Badge>
          <span className="text-[10px] text-secondary">
            {formatTimeHM(message.created_at)}
          </span>
        </div>
      )}
      {isUser && (
        <span className="text-[10px] text-secondary">{formatTimeHM(message.created_at)}</span>
      )}
    </div>
  );
}
