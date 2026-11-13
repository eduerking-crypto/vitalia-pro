"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, HeartPulse } from "lucide-react";
import { ORG_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface OrgSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  orgName?: string;
}

/** Navegación del portal de empresa (IPS/clínica). */
export function OrgSidebar({ mobileOpen, onMobileClose, orgName }: OrgSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/org" ? pathname === "/org" : pathname.startsWith(href);

  const nav = (
    <nav
      aria-label="Navegación del portal de empresa"
      className="flex h-full flex-col gap-1 overflow-y-auto px-3 py-4"
    >
      {ORG_NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onMobileClose}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium",
              "transition-colors duration-200",
              active
                ? "bg-serene-100 text-serene-800 dark:bg-neutral-800 dark:text-serene-200"
                : "text-secondary hover:bg-serene-50 hover:text-ink dark:hover:bg-neutral-900 dark:hover:text-neutral-200",
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 shrink-0",
                active ? "text-serene-600 dark:text-serene-300" : "text-neutral-400",
              )}
              aria-hidden="true"
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}

      <div className="mt-auto space-y-2 border-t border-[color:var(--color-border)] pt-3">
        <Link
          href="/"
          onClick={onMobileClose}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-secondary transition-colors hover:bg-sage-50 hover:text-ink dark:hover:bg-neutral-900"
        >
          <HeartPulse className="h-5 w-5 text-sage-500" aria-hidden="true" />
          Ir a mi salud
        </Link>
      </div>
    </nav>
  );

  const brand = (
    <div className="flex h-16 items-center gap-2 border-b border-[color:var(--color-border)] px-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-serene-500 to-sage-600 text-white">
        <Building2 className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p className="truncate text-sm font-bold tracking-tight">
          {orgName ?? "Portal empresa"}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-secondary">
          VITALIA <span className="text-serene-600">IPS</span>
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[color:var(--color-border)] bg-[color:var(--color-surface)] lg:block">
        {brand}
        {nav}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-up border-r border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-elevated">
            <div className="flex h-16 items-center justify-between border-b border-[color:var(--color-border)] px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-serene-500 to-sage-600 text-white">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-bold tracking-tight">Portal empresa</p>
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
