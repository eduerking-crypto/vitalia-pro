"use client";

import { useCallback, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const text = value.trim();
        if (text) onSend(text);
      }
    },
    [value, onSend],
  );

  useEffect(() => {
    // Ajusta la altura del textarea al contenido.
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu consulta de salud…"
        disabled={disabled}
      />
      <Button
        type="button"
        onClick={handleSend}
        disabled={disabled || value.trim() === ""}
        className="h-10 px-4"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
