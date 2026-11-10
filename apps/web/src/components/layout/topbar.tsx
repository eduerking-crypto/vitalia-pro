"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { NotificationPanel } from "./notification-panel";

export interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

/** Barra superior: búsqueda, tema, notificaciones y menú de usuario. */
export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [notifOpen, setNototifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!notifRef.current?.contains(event.target as Node)) setNototifOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNototifOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const results =
    query.trim().length > 0
      ? NAV_ITEMS.filter((item) =>
          `${item.label} ${item.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      : [];

  const userName = session?.user?.name ?? session?.user?.email ?? "Usuario";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 px-4 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        aria-label="Abrir menú de navegación"
        className="rounded-lg p-2.5 text-secondary transition-colors hover:bg-sage-100 hover:text-ink lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Búsqueda de módulos */}
      <div className="relative max-w-md flex-1">
        <label htmlFor="topbar-search" className="sr-only">
          Buscar en la aplicación
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <input
          id="topbar-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar módulos (medicamentos, citas…)"
          className="h-10 w-full rounded-lg border border-[color:var(--color-border)] bg-bone pl-10 pr-3 text-sm placeholder:text-neutral-400 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500/60 dark:bg-neutral-900"
        />
        {results.length > 0 && (
          <ul className="absolute top-[calc(100%+4px)] z-40 w-full overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-elevated">
            {results.map((item) => (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => {
                    router.push(item.href);
                    setQuery("");
                  }}
                  className="flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm transition-colors hover:bg-sage-50 dark:hover:bg-neutral-800"
                >
                  <item.icon className="h-4 w-4 text-sage-500" aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                  <span className="truncate text-xs text-secondary">
                    {item.description}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Tema claro/oscuro */}
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label={resolvedTheme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          className="rounded-lg p-2.5 text-secondary transition-colors hover:bg-sage-100 hover:text-ink dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Moon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {/* Notificaciones */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNototifOpen((v) => !v)}
            aria-label="Notificaciones"
            aria-expanded={notifOpen}
            className="relative rounded-lg p-2.5 text-secondary transition-colors hover:bg-sage-100 hover:text-ink dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
          </button>
          {notifOpen && <NotificationPanel />}
        </div>

        {/* Usuario */}
        <Dropdown
          trigger={
            <span className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2">
              <Avatar name={userName} size="sm" />
              <span className="hidden max-w-32 truncate text-sm font-medium md:block">
                {userName}
              </span>
            </span>
          }
        >
          <DropdownItem icon={<UserRound className="h-4 w-4" />} onSelect={() => router.push("/profile")}>
            Mi perfil
          </DropdownItem>
          <DropdownItem icon={<Settings className="h-4 w-4" />} onSelect={() => router.push("/settings")}>
            Ajustes
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem
            icon={<LogOut className="h-4 w-4" />}
            danger
            onSelect={() => signOut({ callbackUrl: "/login" })}
          >
            Cerrar sesión
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}

/** Clase auxiliar para animar la entrada de secciones de página. */
export const pageSectionClass = cn("animate-fade-in");
