"use client";

import axios from "axios";
import { API_BASE_URL, DEMO_CREDENTIALS, STATIC_AUTH } from "@/lib/constants";
import { useAuthStore } from "@/stores/use-auth-store";

/**
 * Autenticación directa contra la API.
 *
 * Se usa cuando la web se publica como sitio estático (GitHub Pages / APK),
 * donde no existe el endpoint de NextAuth. Guarda los tokens en el store y
 * el cliente axios los adjunta en cada petición.
 */
export async function loginAgainstApi(email: string, password: string): Promise<void> {
  const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
    email,
    password,
  });

  if (data?.mfa_required) {
    throw new Error("Esta cuenta requiere verificación en dos pasos.");
  }
  if (!data?.access_token || !data?.user) {
    throw new Error("Respuesta de autenticación inválida.");
  }

  const store = useAuthStore.getState();
  store.setUser({
    id: data.user.id,
    email: data.user.email,
    name: data.user.full_name,
    role: data.user.role,
  });
  store.setTokens(data.access_token, data.refresh_token);
}

/** Inicia sesión con la cuenta demo si aún no hay token (solo sitio estático). */
export async function ensureDemoSession(): Promise<void> {
  if (!STATIC_AUTH) return;
  if (useAuthStore.getState().accessToken) return;
  await loginAgainstApi(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
}

/**
 * Garantiza que la sesión activa sea la del usuario indicado.
 * Permite alternar entre el portal de paciente y el de empresa.
 */
export async function ensureSessionAs(email: string, password: string): Promise<void> {
  if (!STATIC_AUTH) return;
  const store = useAuthStore.getState();
  if (store.accessToken && store.user?.email === email) return;
  await loginAgainstApi(email, password);
}
