"use client";

import { create } from "zustand";
import type { UserRole } from "@vitalia/shared-types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clear: () => void;
}

/**
 * Espejo cliente de la sesión NextAuth. La capa API (axios) lee los tokens
 * directamente de este store, sin pasar por React.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  clear: () =>
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
}));
