"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/** Switch accesible con label y descripción asociadas. */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleProps) {
  const id = useId();
  const descriptionId = `${id}-desc`;

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      {(label || description) && (
        <span className="flex flex-col">
          {label && (
            <label htmlFor={id} className="cursor-pointer text-sm font-medium">
              {label}
            </label>
          )}
          {description && (
            <span id={descriptionId} className="text-xs text-secondary">
              {description}
            </span>
          )}
        </span>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-vitalia",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          checked ? "bg-sage-500" : "bg-neutral-300 dark:bg-neutral-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-200 ease-vitalia",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
