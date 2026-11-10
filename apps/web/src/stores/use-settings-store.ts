"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserSettings } from "@vitalia/shared-types";

const defaultSettings: UserSettings = {
  theme: "system",
  language: "es",
  notifications: {
    medications: true,
    appointments: true,
    achievements: true,
    weekly_report: false,
  },
  units: { weight: "kg", temperature: "c", distance: "km" },
  privacy: { share_anonymized_data: false, allow_ai_suggestions: true },
};

interface SettingsState {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

/**
 * Preferencias de usuario (tema, notificaciones, unidades, privacidad).
 * Persistido en localStorage; se sincroniza con la API vía los hooks de settings.
 */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: "vitalia-settings-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
