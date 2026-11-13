"use client";

import { Building2, Download, KeyRound, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useOrg } from "@/hooks/use-org";
import { useOrgPatients } from "@/hooks/use-org";
import { ORG_CREDENTIALS } from "@/lib/constants";
import { toast } from "@/stores/use-notification-store";

export default function OrgSettingsPage() {
  const { data: org } = useOrg();
  const { data: patients } = useOrgPatients();

  const exportCsv = () => {
    const rows = [
      ["Paciente", "Correo", "Riesgo", "Cohorte", "Profesional", "Adherencia", "Medicamentos"],
      ...(patients ?? []).map((p) => [
        p.full_name,
        p.email,
        p.risk_level,
        p.cohort ?? "",
        p.professional_name ?? "",
        String(p.adherence_rate),
        String(p.medications_active),
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vitalia-pacientes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Reporte exportado", "Se descargó el CSV de pacientes.");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Ajustes de la organización</h1>
        <p className="mt-1 text-sm text-secondary">Datos de la empresa, plan contratado y accesos.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Datos de la empresa</CardTitle>
            <Badge variant="serene">
              <Building2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              {org?.sector ?? "IPS"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Razón social" value={org?.name ?? "—"} />
            <Row label="Identificación" value={org?.tax_id ?? "—"} />
            <Row label="Ciudad" value={[org?.city, org?.country].filter(Boolean).join(", ") || "—"} />
            <Row label="Plan" value={(org?.plan ?? "pro").toUpperCase()} />
            <Row label="Cupos contratados" value={`${org?.seats ?? 0} pacientes`} />
            <Row label="Color de marca" value={org?.primary_color ?? "#4E7B84"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos de demostración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg border border-[color:var(--color-border)] p-3">
              <p className="flex items-center gap-2 font-semibold">
                <KeyRound className="h-4 w-4 text-serene-600" aria-hidden="true" />
                Administrador de la IPS
              </p>
              <p className="mt-1 text-secondary">{ORG_CREDENTIALS.email}</p>
              <p className="text-secondary">Contraseña: {ORG_CREDENTIALS.password}</p>
            </div>
            <div className="rounded-lg border border-[color:var(--color-border)] p-3">
              <p className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-sage-600" aria-hidden="true" />
                Paciente
              </p>
              <p className="mt-1 text-secondary">demo@vitalia.health</p>
              <p className="text-secondary">Contraseña: Demo1234!</p>
            </div>
            <Button variant="outline" className="w-full" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Exportar pacientes (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seguridad y cumplimiento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900/60">
            <p className="font-semibold">Cifrado</p>
            <p className="mt-1 text-xs text-secondary">Campos sensibles cifrados con Fernet (AES-128).</p>
          </div>
          <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900/60">
            <p className="font-semibold">Auditoría</p>
            <p className="mt-1 text-xs text-secondary">Registro encadenado SHA-256 de cada acceso a datos clínicos.</p>
          </div>
          <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900/60">
            <p className="font-semibold">Roles</p>
            <p className="mt-1 text-xs text-secondary">Paciente, profesional y administrador con permisos separados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] pb-2 last:border-0 last:pb-0">
      <span className="text-secondary">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
