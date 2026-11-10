"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WATER_GLASS_ML } from "@/lib/constants";

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export interface DayActivity {
  steps: number;
  activeMinutes: number;
  waterGlasses: number;
}

interface HealthState {
  today: string;
  waterGlasses: number;
  waterGoalGlasses: number;
  steps: number;
  stepsGoal: number;
  activeMinutes: number;
  weekSteps: Record<string, number>;
  ensureToday: () => void;
  addWater: (glasses?: number) => void;
  removeWater: () => void;
  setWaterGoalGlasses: (glasses: number) => void;
  logActivity: (steps: number, activeMinutes: number) => void;
  setStepsGoal: (goal: number) => void;
  resetDay: () => void;
}

/**
 * Métricas diarias registradas localmente: hidratación, pasos y minutos activos.
 * (Los signos vitales clínicos viven en la API; esto es el diario personal.)
 */
export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      today: todayKey(),
      waterGlasses: 0,
      waterGoalGlasses: 8,
      steps: 6480,
      stepsGoal: 8000,
      activeMinutes: 42,
      weekSteps: {},
      ensureToday: () => {
        const today = todayKey();
        if (get().today !== today) {
          const prev = get();
          set({
            today,
            waterGlasses: 0,
            steps: 0,
            activeMinutes: 0,
            weekSteps: { ...prev.weekSteps, [prev.today]: prev.steps },
          });
        }
      },
      addWater: (glasses = 1) => {
        get().ensureToday();
        set((state) => ({
          waterGlasses: Math.min(state.waterGoalGlasses, state.waterGlasses + glasses),
        }));
      },
      removeWater: () => {
        get().ensureToday();
        set((state) => ({ waterGlasses: Math.max(0, state.waterGlasses - 1) }));
      },
      setWaterGoalGlasses: (glasses) => set({ waterGoalGlasses: Math.max(1, glasses) }),
      logActivity: (steps, activeMinutes) => {
        get().ensureToday();
        set((state) => ({
          steps: Math.max(0, state.steps + steps),
          activeMinutes: Math.max(0, state.activeMinutes + activeMinutes),
        }));
      },
      setStepsGoal: (goal) => set({ stepsGoal: Math.max(500, goal) }),
      resetDay: () => set({ waterGlasses: 0, steps: 0, activeMinutes: 0 }),
    }),
    {
      name: "vitalia-health-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Volumen total de agua en ml del día. */
export const waterMl = (glasses: number) => glasses * WATER_GLASS_ML;
