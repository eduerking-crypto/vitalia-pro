"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

/** Layout autenticado: sidebar + topbar + guardia de sesión. */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
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

  if (status === "unauthenticated") {
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
