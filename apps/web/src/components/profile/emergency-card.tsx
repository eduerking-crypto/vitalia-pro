"use client";

import { AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

interface EmergencyCardProps {
  medical?: {
    blood_type?: string;
    allergies?: Array<{ severity: string }>;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    chronic_conditions?: string[];
  } | null;
}

const SEVERITY_LABELS: Record<string, string> = {
  mild: "Leve",
  moderate: "Moderada",
  severe: "Grave",
  "life-threatening": "Peligrosa para la vida",
};

export function EmergencyCard({ medical }: EmergencyCardProps) {
  const severeAllergies = (medical?.allergies ?? []).filter(
    (a) => a.severity === "severe" || a.severity === "life-threatening",
  );

  return (
    <Card className="border-l-4 border-l-danger relative overflow-hidden">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-500/10 blur-3xl" aria-hidden="true" />
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger" aria-hidden="true" />
          <CardTitle className="text-danger">Credencial de emergencia</CardTitle>
        </div>
        <Badge variant="danger">VITALIA PRO</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <span className="text-xl font-bold">{medical?.blood_type ?? "?"}</span>
          </span>
          <div>
            <p className="text-xs text-secondary uppercase tracking-wider">Grupo sanguíneo</p>
            <p className="text-xl font-bold tabular-nums">{medical?.blood_type ?? "No indicado"}</p>
          </div>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between border-b border-[color:var(--color-border)] pb-1">
            <span className="text-secondary">Alergias graves</span>
            <span>
              {severeAllergies.length > 0
                ? severeAllergies.map((a) => SEVERITY_LABELS[a.severity]).join(", ")
                : "Ninguna registrada"}
            </span>
          </div>
          <div className="flex justify-between border-b border-[color:var(--color-border)] pb-1">
            <span className="text-secondary">Contacto de emergencia</span>
            <span>
              {medical?.emergency_contact_name ?? "—"} ({medical?.emergency_contact_phone ?? "—"})
            </span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-secondary">Condiciones crónicas</span>
            <span className="line-clamp-2">
              {(medical?.chronic_conditions ?? []).join(", ") || "—"}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-secondary">
          Muestra esta pantalla al personal sanitario en caso de urgencia.
        </p>
      </CardContent>
    </Card>
  );
}
