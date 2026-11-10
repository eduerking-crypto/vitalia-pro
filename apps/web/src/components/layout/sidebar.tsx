"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/** Navegación lateral: fija en desktop, drawer en móvil. */
export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const nav = (
    <nav
      aria-label="Navegación principal"
      className="flex h-full flex-col gap-1 overflow-y-auto px-3 py-4"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onMobileClose}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium",
              "transition-colors duration-200 ease-vitalia",
              active
                ? "bg-sage-100 text-sage-700 dark:bg-neutral-800 dark:text-sage-300"
                : "text-secondary hover:bg-sage-50 hover:text-ink dark:hover:bg-neutral-900 dark:hover:text-neutral-200",
            )}
          >
            <item.icon
              className={cn("h-5 w-5 shrink-0", active ? "text-sage-600 dark:text-sage-300" : "text-neutral-400")}
              aria-hidden="true"
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[color:var(--color-border)] bg-[color:var(--color-surface)] lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-[color:var(--color-border)] px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sage-400 to-serene-500 text-white">
            <Heart className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight">
              VITALIA<span className="text-sage-500"> Pro</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-secondary">
              Salud integral
            </p>
          </div>
        </div>
        {nav}
      </aside>

      {/* Móvil (drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-up border-r border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-elevated">
            <div className="flex h-16 items-center justify-between border-b border-[color:var(--color-border)] px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sage-400 to-serene-500 text-white">
                  <Heart className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-base font-bold tracking-tight">
                  VITALIA<span className="text-sage-500"> Pro</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Cerrar menú"
                className="rounded-lg p-2 text-secondary hover:text-ink"
              >
                ✕
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
