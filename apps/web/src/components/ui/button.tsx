"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-soft",
  secondary:
    "bg-serene-500 text-white hover:bg-serene-600 active:bg-serene-700 shadow-soft",
  ghost:
    "bg-transparent text-ink hover:bg-sage-100/70 dark:text-neutral-100 dark:hover:bg-neutral-800",
  danger:
    "bg-danger text-white hover:bg-red-700 active:bg-red-800 shadow-soft",
  outline:
    "border border-sage-400 bg-transparent text-sage-600 hover:bg-sage-100/60 dark:text-sage-300 dark:hover:bg-neutral-800",
};

const sizeClasses: Record<ButtonSize, string> = {
  // Altura mínima táctil 44px (WCAG 2.1 AA) para md/lg/icon.
  sm: "h-9 px-3 text-sm gap-1.5 rounded-md",
  md: "h-11 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2 rounded-lg",
  icon: "h-11 w-11 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, fullWidth, disabled, children, type = "button", ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-colors duration-200 ease-vitalia select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900",
        "disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
