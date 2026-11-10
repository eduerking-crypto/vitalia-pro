"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-neutral-400",
            "transition-colors duration-200 ease-vitalia",
            "focus:outline-none focus:ring-2 focus:ring-sage-500/70 focus:border-sage-400",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error ? "border-danger" : "border-[color:var(--color-border)]",
            "dark:bg-neutral-900/60 dark:text-neutral-100",
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-secondary">{hint}</p>}
        {error && (
          <p role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
