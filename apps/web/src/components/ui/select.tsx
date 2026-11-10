"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            className={cn(
              "h-11 w-full appearance-none rounded-lg border bg-white px-3 pr-10 text-sm text-ink",
              "transition-colors duration-200 ease-vitalia",
              "focus:outline-none focus:ring-2 focus:ring-sage-500/70 focus:border-sage-400",
              "disabled:cursor-not-allowed disabled:opacity-60",
              error ? "border-danger focus:border-danger" : "border-[color:var(--color-border)]",
              "dark:bg-neutral-900/60 dark:text-neutral-100",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
        </div>
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
Select.displayName = "Select";
