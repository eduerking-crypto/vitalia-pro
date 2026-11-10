"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TagProps {
  label: string;
  onRemove?: () => void;
  variant?: "sage" | "serene" | "danger" | "warning" | "neutral";
  className?: string;
}

const variants = {
  sage: "bg-sage-100 text-sage-700 dark:bg-sage-700/30 dark:text-sage-300",
  serene: "bg-serene-100 text-serene-700 dark:bg-serene-700/30 dark:text-serene-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300",
  neutral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

/** Chip con opción de eliminación (usado en alergias, condiciones). */
export function Tag({ label, onRemove, variant = "sage", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${label}`}
          className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
