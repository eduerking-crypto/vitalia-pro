"use client";

import {
  useId,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

/** Tabs accesibles con navegación por teclado (flechas). */
export function Tabs({
  items,
  defaultTabId,
  className,
}: {
  items: TabItem[];
  defaultTabId?: string;
  className?: string;
}) {
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id ?? "");
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const focusTab = (index: number) => {
    const tab = tabsRef.current[index];
    tab?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const lastIndex = items.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = index === lastIndex ? 0 : index + 1;
    if (event.key === "ArrowLeft") next = index === 0 ? lastIndex : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = lastIndex;
    if (next !== null) {
      event.preventDefault();
      const target = items[next];
      if (target) {
        setActiveId(target.id);
        focusTab(next);
      }
    }
  };

  const active = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Secciones"
        className="flex gap-1 overflow-x-auto rounded-xl bg-sage-50 p-1 dark:bg-neutral-900"
      >
        {items.map((item, index) => {
          const isActive = item.id === active?.id;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabsRef.current[index] = el;
              }}
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "flex h-10 min-w-max items-center gap-2 rounded-lg px-4 text-sm font-medium",
                "transition-colors duration-200 ease-vitalia",
                isActive
                  ? "bg-[color:var(--color-surface)] text-ink shadow-soft dark:text-neutral-100"
                  : "text-secondary hover:text-ink dark:hover:text-neutral-200",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${active.id}`}
          aria-labelledby={`${baseId}-tab-${active.id}`}
          tabIndex={0}
          className="mt-4"
        >
          {active.content}
        </div>
      )}
    </div>
  );
}
