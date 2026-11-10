"use client";

import { cn } from "@/lib/utils";

export function TypingIndicator() {
  return (
    <div className="mr-auto flex max-w-[70%] flex-col gap-1">
      <div className="rounded-2xl bg-white p-4 text-sm text-ink dark:bg-neutral-900 dark:text-neutral-100 border border-[color:var(--color-border)] shadow-soft">
        <span className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 animate-typing-dot",
              )}
              aria-hidden="true"
            />
          ))}
        </span>
      </div>
      <span className="text-[10px] text-secondary">El asistente está escribiendo…</span>
    </div>
  );
}
