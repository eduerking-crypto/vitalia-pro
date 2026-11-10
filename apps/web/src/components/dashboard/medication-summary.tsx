"use client";

import { Check, Pill, Undo2, X } from "lucide-react";
import { useMedications, useMedicationMutations } from "@/hooks/use-medications";
import { useMedicationStore } from "@/stores/use-medication-store";
import { Badge, Button, EmptyState, Skeleton, SkeletonText } from "@/components/ui";
import { cn, formatTimeHM } from "@/lib/utils";
import type { MedicationView } from "@/types/medication";

const FREQUENCY_LABELS: Record<string, string> = {
  once_daily: "1×/día",
  twice_daily: "2×/día",
  three_times_daily: "3×/día",
  every_8h: "cada 8 h",
  every_12h: "cada 12 h",
  as_needed: "si lo necesitas",
  weekly: "semanal",
};

/** Próximas tomas de hoy con registro rápido. */
export function MedicationSummary() {
  const { data: medications, isLoading } = useMedications();
  const { markTaken, undoTaken } = useMedicationMutations();
  const takenToday = useMedicationStore((s) => s.takenToday);
  useMedicationStore.getState().ensureToday();

  if (isLoading) {
    return (
      <section className="card-surface p-5" aria-label="Medicación de hoy">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 flex flex-col gap-3">
          <SkeletonText lines={3} />
        </div>
      </section>
    );
  }

  const active = (medications ?? []) as MedicationView[];
  const sorted = [...active].sort((a, b) => a.time.localeCompare(b.time));
  const pendingCount = sorted.filter((m) => takenToday[m.id] !== "taken").length;

  return (
    <section className="card-surface p-5" aria-label="Medicación de hoy">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Medicación de hoy</h2>
        <Badge variant={pendingCount === 0 ? "success" : "serene"} dot>
          {pendingCount === 0 ? "Al día" : `${pendingCount} pendiente${pendingCount === 1 ? "" : "s"}`}
        </Badge>
      </header>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="Sin medicación activa"
          description="Añade tus tratamientos desde el módulo de Medicamentos."
          className="py-6"
        />
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-[color:var(--color-border)]">
          {sorted.map((med) => {
            const status = takenToday[med.id];
            return (
              <li key={med.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={cn(
                    "w-12 shrink-0 rounded-md px-1.5 py-1 text-center text-xs font-bold tabular-nums",
                    status === "taken"
                      ? "bg-success/10 text-success"
                      : "bg-sage-100 text-sage-700 dark:bg-neutral-800 dark:text-sage-300",
                  )}
                >
                  {formatTimeHM(med.time)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm font-medium", status === "taken" && "line-through opacity-60")}>
                    {med.name} · {med.dosage}
                  </p>
                  <p className="text-xs text-secondary">
                    {FREQUENCY_LABELS[med.frequency] ?? med.frequency}
                    {med.remaining_quantity < 10 && (
                      <span className="ml-2 font-medium text-warning">
                        · stock bajo ({med.remaining_quantity})
                      </span>
                    )}
                  </p>
                </div>
                {status === "taken" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => undoTaken(med.id)}
                    aria-label={`Deshacer toma de ${med.name}`}
                  >
                    <Undo2 className="h-4 w-4" aria-hidden="true" />
                    Deshacer
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={status === "skipped" ? "outline" : "primary"}
                      onClick={() => markTaken.mutate({ id: med.id, status: "taken" })}
                      loading={markTaken.isPending && markTaken.variables?.id === med.id}
                      aria-label={`Marcar ${med.name} como tomada`}
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Tomada
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markTaken.mutate({ id: med.id, status: "skipped" })}
                      aria-label={`Marcar ${med.name} como saltada`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
