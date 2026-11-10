"use client";

import { useNotifications, useNotificationMutations } from "@/hooks/use-notifications";
import {
  AlarmClock,
  Bell,
  CalendarCheck,
  Trophy,
  TriangleAlert,
} from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";
import type { NotificationType } from "@vitalia/shared-types";

const icons: Record<NotificationType, typeof Bell> = {
  medication: AlarmClock,
  appointment: CalendarCheck,
  achievement: Trophy,
  alert: TriangleAlert,
};

const iconColors: Record<NotificationType, string> = {
  medication: "bg-serene-100 text-serene-600 dark:bg-serene-700/30 dark:text-serene-300",
  appointment: "bg-sage-100 text-sage-600 dark:bg-sage-700/30 dark:text-sage-300",
  achievement: "bg-amber-100 text-amber-600 dark:bg-amber-700/30 dark:text-amber-300",
  alert: "bg-red-100 text-danger dark:bg-red-700/30 dark:text-red-300",
};

/** Panel de notificaciones (campana del topbar). */
export function NotificationPanel() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { markRead, markAllRead } = useNotificationMutations();

  const unread = notifications.filter((n) => !n.is_read);

  return (
    <div
      role="dialog"
      aria-label="Notificaciones"
      className="absolute top-[calc(100%+8px)] right-0 z-40 w-80 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-elevated"
    >
      <header className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-3">
        <p className="text-sm font-semibold">Notificaciones</p>
        {unread.length > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            className="text-xs font-medium text-serene-500 hover:text-serene-600"
          >
            Marcar todas ({unread.length})
          </button>
        )}
      </header>
      <div className="max-h-96 overflow-y-auto">
        {isLoading && (
          <p className="px-4 py-6 text-center text-sm text-secondary">Cargando…</p>
        )}
        {!isLoading && notifications.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-secondary">
            No tienes notificaciones.
          </p>
        )}
        {notifications.map((n) => {
          const Icon = icons[n.type] ?? Bell;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => !n.is_read && markRead.mutate(n.id)}
              className={cn(
                "flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-0",
                "border-[color:var(--color-border)] hover:bg-sage-50 dark:hover:bg-neutral-900",
                !n.is_read && "bg-sage-50/50 dark:bg-neutral-900/50",
              )}
            >
              <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconColors[n.type])}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{n.title}</span>
                  {!n.is_read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-serene-500" aria-label="No leída" />
                  )}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-xs text-secondary">
                  {n.message}
                </span>
                <span className="mt-1 block text-[10px] uppercase tracking-wide text-secondary">
                  {timeAgo(n.created_at)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
