import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "sage"
  | "serene"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  sage: "bg-sage-100 text-sage-700 dark:bg-sage-700/30 dark:text-sage-300",
  serene: "bg-serene-100 text-serene-700 dark:bg-serene-700/30 dark:text-serene-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300",
  neutral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  outline: "border border-[color:var(--color-border)] text-secondary",
};

const dots: Record<BadgeVariant, string> = {
  sage: "bg-sage-500",
  serene: "bg-serene-500",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-neutral-400",
  outline: "bg-neutral-400",
};

export function Badge({ className, variant = "sage", dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dots[variant])} aria-hidden="true" />}
      {children}
    </span>
  );
}
