"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert } from "@/components/ui";
import { QUERY_KEYS } from "@/lib/constants";
import { fetchInteractions } from "@/lib/api/medications";
import type { DrugInteraction } from "@/types/medication";

const severityVariant: Record<DrugInteraction["severity"], string> = {
  minor: "outline",
  moderate: "warning",
  major: "danger",
  contraindicated: "danger",
};
const severityLabel: Record<DrugInteraction["severity"], string> = {
  minor: "Leve",
  moderate: "Moderada",
  major: "Mayor",
  contraindicated: "Contraindicada",
};

export function InteractionAlert() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.medicationInteractions,
    queryFn: fetchInteractions,
  });

  if (isLoading) return null;
  const interactions: DrugInteraction[] = data?.interactions ?? [];

  if (interactions.length === 0) {
    return (
      <Alert variant="success" title="Sin interacciones detectadas">
        No se han detectado interacciones relevantes entre tus medicamentos actuales.
      </Alert>
    );
  }

  const major = interactions.some((i) => i.severity === "major" || i.severity === "contraindicated");

  return (
    <Alert variant={major ? "danger" : "warning"} title="Interacción entre medicamentos" className="mb-4">
      {interactions.map((i) => (
        <div key={`${i.medication_a}-${i.medication_b}`} className="mt-3 rounded-lg border border-[color:var(--color-border)] bg-sage-50/50 p-3 dark:bg-neutral-800/50">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm">{i.medication_a} + {i.medication_b}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-danger bg-red-50 dark:bg-red-900/20">
              {severityLabel[i.severity]}
            </span>
          </div>
          <p className="mt-1 text-sm text-secondary">{i.description}</p>
          <p className="mt-1 text-sm font-medium text-ink dark:text-neutral-100">
            Recomendación: {i.recommendation}
          </p>
        </div>
      ))}
      <p className="mt-3 text-xs text-secondary italic">
        Esta información es orientativa. Consulta siempre a tu médico o farmacéutico antes
        de modificar cualquier tratamiento.
      </p>
    </Alert>
  );
}
