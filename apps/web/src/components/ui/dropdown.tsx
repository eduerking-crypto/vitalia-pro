"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

/** Menú desplegable accesible: click fuera, Escape y roles ARIA. */
export function Dropdown({ trigger, children, align = "right", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        previouslyFocused.current?.focus?.();
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          previouslyFocused.current = document.activeElement as HTMLElement | null;
          setOpen((v) => !v);
        }}
        className="flex items-center"
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-[calc(100%+8px)] z-40 min-w-48 rounded-xl border p-1 shadow-elevated",
            "bg-[color:var(--color-surface)] border-[color:var(--color-border)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onSelect,
  icon,
  danger = false,
  className,
}: {
  children: ReactNode;
  onSelect?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
        "transition-colors duration-150 hover:bg-sage-100 dark:hover:bg-neutral-800",
        danger ? "text-danger" : "text-ink dark:text-neutral-100",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return (
    <div
      role="separator"
      className="my-1 h-px bg-[color:var(--color-border)]"
    />
  );
}
