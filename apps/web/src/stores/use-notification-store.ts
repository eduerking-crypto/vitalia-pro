"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

interface NotificationState {
  toasts: ToastItem[];
  pushToast: (toast: {
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }) => void;
  dismissToast: (id: string) => void;
}

/**
 * Toasts globales de la aplicación. La capa API también emite avisos
 * (p. ej. al activar el modo demostración) accediendo al store directamente.
 */
export const useNotificationStore = create<NotificationState>()((set) => ({
  toasts: [],
  pushToast: ({ type, title, message, duration = 4500 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ toasts: [...state.toasts, { id, type, title, message, duration }] }));
    if (duration > 0 && typeof window !== "undefined") {
      window.setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Helper fuera de React. */
export const toast = {
  success: (title: string, message?: string) =>
    useNotificationStore.getState().pushToast({ type: "success", title, message }),
  error: (title: string, message?: string) =>
    useNotificationStore.getState().pushToast({ type: "error", title, message }),
  warning: (title: string, message?: string) =>
    useNotificationStore.getState().pushToast({ type: "warning", title, message }),
  info: (title: string, message?: string) =>
    useNotificationStore.getState().pushToast({ type: "info", title, message }),
};
