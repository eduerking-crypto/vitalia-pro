"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HeartPulse, Menu, Moon, Sun, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/use-auth-store";

export interface OrgTopbarProps {
  onOpenMobileSidebar: () => void;
}

/** Barra superior del portal de empresa. */
export function OrgTopbar({ onOpenMobileSidebar }: OrgTopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 px-4 backdrop-blur-lg lg:px-8">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Abrir menú"
          className="rounded-lg p-2 text-secondary hover:bg-neutral-100 hover:text-ink lg:hidden dark:hover:bg-neutral-800"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div>
          <p className="text-sm font-semibold leading-tight">Portal de empresa</p>
          <p className="text-[11px] text-secondary">
            Gestión de pacientes, agenda y resultados
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Link
          href="/"
          className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50 sm:flex dark:text-sage-300 dark:hover:bg-neutral-800"
        >
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          Mi salud
        </Link>

        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={resolvedTheme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
            className="rounded-lg p-2 text-secondary hover:bg-neutral-100 hover:text-ink dark:hover:bg-neutral-800"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        )}

        <div className="ml-1 flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] px-2 py-1.5">
          <Avatar name={user?.name ?? "Administrador"} size="sm" />
          <div className="hidden leading-tight sm:block">
            <p className="max-w-[140px] truncate text-xs font-semibold">
              {user?.name ?? "Administrador"}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-secondary">
              {user?.role === "admin" ? "Administrador" : "Profesional"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
