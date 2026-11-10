"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { useNotificationStore, type ToastItem } from "@/stores/use-notification-store";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "border-l-success",
  error: "border-l-danger",
  warning: "border-l-warning",
  info: "border-l-info",
};

const iconColors = {
  success: "text-success",
  error: "text-danger",
  warning: "text-warning",
  info: "text-info",
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const dismiss = useNotificationStore((s) => s.dismissToast);
  const Icon = icons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      role={toast.type === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border-l-4 px-4 py-3 shadow-elevated",
        "bg-[color:var(--color-surface)] border border-[color:var(--color-border)]",
        styles[toast.type],
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColors[toast.type])} aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-sm text-secondary">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Descartar aviso"
        className="rounded-md p-1 text-secondary transition-colors hover:text-ink"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

/** Punto de render global de toasts (montado una vez en Providers). */
export function ToastViewport() {
  const toasts = useNotificationStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones del sistema"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
