"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/stores/use-auth-store";
import { DEMO_CREDENTIALS } from "@/lib/constants";

/** ¿Estamos en modo demostración? (API en localhost o bandera activa) */
const DEMO =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  (process.env.NEXT_PUBLIC_API_URL ?? "").includes("localhost") ||
  (process.env.NEXT_PUBLIC_API_URL ?? "").includes("127.0.0.1") ||
  !process.env.NEXT_PUBLIC_API_URL;

/** Layout autenticado: sidebar + topbar + guardia de sesión. */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // En modo demo, autentica directamente al usuario demo sin sesión real.
  useEffect(() => {
    if (!DEMO) return;
    const store = useAuthStore.getState();
    if (!store.isAuthenticated) {
      const u = DEMO_CREDENTIALS.authResponse.user;
      store.setUser({ id: u.id, email: u.email, name: u.full_name, role: u.role });
      store.setTokens(
        DEMO_CREDENTIALS.authResponse.access_token,
        DEMO_CREDENTIALS.authResponse.refresh_token,
      );
    }
  }, []);

  useEffect(() => {
    if (!DEMO && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // En modo demo nunca bloqueamos: renderizamos directamente.
  if (!DEMO && status === "loading") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-bone dark:bg-neutral-950"
        role="status"
        aria-label="Cargando sesión"
      >
        <div className="flex flex-col items-center gap-3 text-sage-600">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
          <p className="text-sm text-secondary">Cargando tu sesión…</p>
        </div>
      </div>
    );
  }

  if (!DEMO && status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-bone dark:bg-neutral-950">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="lg:pl-64">
        <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main
          id="contenido-principal"
          className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
