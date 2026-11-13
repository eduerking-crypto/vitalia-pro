"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { OrgSidebar } from "@/components/layout/org-sidebar";
import { OrgTopbar } from "@/components/layout/org-topbar";
import { ORG_CREDENTIALS, STATIC_AUTH } from "@/lib/constants";
import { ensureSessionAs } from "@/lib/auth-client";
import { useOrg } from "@/hooks/use-org";
import { useAuthStore } from "@/stores/use-auth-store";

/**
 * Layout del portal de empresa (IPS/clínica).
 * En el sitio estático inicia sesión como administrador de la organización demo.
 */
export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [booting, setBooting] = useState(STATIC_AUTH);
  const token = useAuthStore((s) => s.accessToken);
  const { data: org } = useOrg(!booting && (!STATIC_AUTH || !!token));

  useEffect(() => {
    if (!STATIC_AUTH) return;
    let cancelled = false;
    ensureSessionAs(ORG_CREDENTIALS.email, ORG_CREDENTIALS.password)
      .catch(() => {
        /* sin API: se muestran los datos locales de respaldo */
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-serene-600" role="status">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
          <p className="text-sm text-secondary">Cargando portal de empresa…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone dark:bg-neutral-950">
      <OrgSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        orgName={org?.name}
      />
      <div className="lg:pl-64">
        <OrgTopbar onOpenMobileSidebar={() => setMobileOpen(true)} />
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
