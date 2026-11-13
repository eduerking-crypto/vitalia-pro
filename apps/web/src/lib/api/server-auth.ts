import type { AuthResponse } from "@vitalia/shared-types";
import { DEMO_CREDENTIALS } from "@/lib/constants";

/**
 * Detecta el modo demostración sin importar client.ts (que depende del
 * navegador: axios, localStorage). En el servidor (NextAuth) se evalúa
 * aquí para poder autenticar al usuario demo sin llamadas de red.
 */
function serverDemoMode(): boolean {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE;
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return (
    demoMode === "true" ||
    apiBase.includes("localhost") ||
    apiBase.includes("127.0.0.1")
  );
}

/**
 * Login contra la API FastAPI.
 * En modo demostración (API no disponible), autentica directamente al
 * usuario demo sin llamar a la red.
 */
export async function loginWithApi(input: {
  email: string;
  password: string;
  mfaCode?: string;
}): Promise<AuthResponse | null> {
  // Modo demostración: credenciales demo sin MFA, sin llamadas de red.
  if (serverDemoMode()) {
    const email = input.email.trim().toLowerCase();
    if (
      email === DEMO_CREDENTIALS.email &&
      input.password === DEMO_CREDENTIALS.password
    ) {
      return DEMO_CREDENTIALS.authResponse;
    }
    return null;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${apiBase}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: input.email, password: input.password }),
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = (await res.json()) as AuthResponse & {
      mfa_required?: boolean;
      mfa_token?: string;
    };

    if (data.mfa_required) {
      if (!input.mfaCode || !data.mfa_token) return null;
      const verify = await fetch(`${apiBase}/api/v1/auth/mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfa_token: data.mfa_token, code: input.mfaCode }),
        cache: "no-store",
      });
      if (!verify.ok) return null;
      return (await verify.json()) as AuthResponse;
    }

    return data;
  } catch {
    return null;
  }
}

export async function registerWithApi(input: {
  email: string;
  password: string;
  full_name: string;
  date_of_birth: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${apiBase}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { detail?: string } | null;
    return { ok: false, error: body?.detail ?? "No se pudo crear la cuenta." };
  } catch {
    return {
      ok: false,
      error:
        "La API no está disponible. Levántala con Docker (docker compose up -d) o usa la cuenta demo para explorar.",
    };
  }
}
