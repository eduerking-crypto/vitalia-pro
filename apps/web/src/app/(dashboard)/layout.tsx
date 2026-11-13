"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/stores/use-auth-store";
import { DEMO_CREDENTIALS, STATIC_AUTH } from "@/lib/constants";
import { ensureDemoSession } from "@/lib/auth-client";

/** Modo demostración local (sin backend): datos de ejemplo en el navegador. */
const DEMO =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  (process.env.NEXT_PUBLIC_API_URL ?? "").includes("localhost") ||
  (process.env.NEXT_PUBLIC_API_URL ?? "").includes("127.0.0.1") ||
  !process.env.NEXT_PUBLIC_API_URL;

function LoadingScreen() {
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

/** Layout autenticado: sidebar + topbar + guardia de sesión. */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(STATIC_AUTH);

  // Sitio estático (GitHub Pages / APK): inicia sesión contra la API real.
  useEffect(() => {
    if (!STATIC_AUTH) return;
    let cancelled = false;
    ensureDemoSession()
      .catch(() => {
        /* sin API disponible: el cliente cae al modo demostración */
      })
      .finally(() => {
        if (!cancelled) setBootstrapping(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Modo demo local: autentica con datos de ejemplo, sin backend.
  useEffect(() => {
    if (!DEMO || STATIC_AUTH) return;
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
    if (DEMO || STATIC_AUTH) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (STATIC_AUTH) {
    if (bootstrapping) return <LoadingScreen />;
    return (
      <div className="min-h-screen bg-bone dark:bg-neutral-950">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
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

  if (!DEMO && status === "loading") return <LoadingScreen />;
  if (!DEMO && status === "unauthenticated") return null;

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
