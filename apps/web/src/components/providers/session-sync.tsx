"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/use-auth-store";

/**
 * Mantiene el store Zustand sincronizado con la sesión de NextAuth
 * para que la capa axios tenga acceso a los JWT sin hooks.
 */
export function SessionSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      useAuthStore.getState().setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        role: session.user.role,
      });
      useAuthStore
        .getState()
        .setTokens(session.accessToken, session.refreshToken);
    } else if (status === "unauthenticated") {
      useAuthStore.getState().clear();
    }
  }, [session, status]);

  return null;
}
