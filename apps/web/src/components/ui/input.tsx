"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              "h-11 w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-neutral-400",
              "transition-colors duration-200 ease-vitalia",
              "focus:outline-none focus:ring-2 focus:ring-sage-500/70 focus:border-sage-400",
              "disabled:cursor-not-allowed disabled:opacity-60",
              icon && "pl-10",
              error &&
                "border-danger focus:border-danger focus:ring-danger/30",
              !error && "border-[color:var(--color-border)]",
              "dark:bg-neutral-900/60 dark:text-neutral-100",
              className,
            )}
            {...props}
          />
        </div>
        {hint && !error && (
          <p id={hintId} className="text-xs text-secondary">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
