"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export type TakeStatus = "taken" | "skipped";

interface MedicationState {
  today: string;
  takenToday: Record<string, TakeStatus>;
  ensureToday: () => void;
  markTaken: (medicationId: string) => void;
  markSkipped: (medicationId: string) => void;
  undo: (medicationId: string) => void;
  isTaken: (medicationId: string) => boolean;
}

/**
 * Registro local de las tomas del día (se sincroniza con la API mediante
 * PATCH /medications/{id}/taken desde los hooks).
 */
export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      today: todayKey(),
      takenToday: {},
      ensureToday: () => {
        const today = todayKey();
        if (get().today !== today) {
          set({ today, takenToday: {} });
        }
      },
      markTaken: (medicationId) => {
        get().ensureToday();
        set((state) => ({
          takenToday: { ...state.takenToday, [medicationId]: "taken" },
        }));
      },
      markSkipped: (medicationId) => {
        get().ensureToday();
        set((state) => ({
          takenToday: { ...state.takenToday, [medicationId]: "skipped" },
        }));
      },
      undo: (medicationId) => {
        get().ensureToday();
        set((state) => {
          const next = { ...state.takenToday };
          delete next[medicationId];
          return { takenToday: next };
        });
      },
      isTaken: (medicationId) => get().takenToday[medicationId] === "taken",
    }),
    {
      name: "vitalia-medication-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
