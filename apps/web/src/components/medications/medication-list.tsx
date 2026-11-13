"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit3, MoreHorizontal } from "lucide-react";
import { useMedicationMutations, useMedications } from "@/hooks/use-medications";
import { useMedicationStore } from "@/stores/use-medication-store";
import { Modal } from "@/components/ui";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatTimeHM } from "@/lib/utils";
import type { Medication } from "@/types/medication";

const FREQUENCY_LABELS: Record<string, string> = {
  once_daily: "1 vez al día",
  twice_daily: "2 veces al día",
  three_times_daily: "3 veces al día",
  every_8h: "Cada 8 h",
  every_12h: "Cada 12 h",
  as_needed: "Según necesidad",
  weekly: "Semanal",
};

interface MedicationListProps {
  medications: Medication[];
  onEdit: (id: string) => void;
}

export function MedicationList({ medications, onEdit }: MedicationListProps) {
  const { remove } = useMedicationMutations();
  const takenToday = useMedicationStore((s) => s.takenToday);
  const [openId, setOpenId] = useState<string | null>(null);

  useMedicationStore.getState().ensureToday();

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold">Tus tratamientos</h2>
      <div className="grid gap-3">
        {medications.map((med) => (
          <div
            key={med.id}
            className={cn(
              "card-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
              takenToday[med.id] === "taken" && "opacity-75",
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={cn("text-base font-semibold", takenToday[med.id] === "taken" && "line-through opacity-60")}>
                  {med.name}
                </h3>
                {med.reminder_enabled && <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600 text-[10px]">R</span>}
              </div>
              <p className="text-xs text-secondary">{med.active_ingredient} · {med.dosage}</p>
              <p className="text-xs text-secondary">
                {FREQUENCY_LABELS[med.frequency] ?? med.frequency} · {formatTimeHM(med.time)}
                {med.remaining_quantity < 10 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-warning">
                    ⚠ Stock bajo ({med.remaining_quantity})
                  </span>
                )}
              </p>
            </div>
            <Dropdown
              trigger={
                <button
                  type="button"
                  aria-label="Más opciones"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-sage-50 hover:text-ink dark:hover:bg-neutral-800"
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </button>
              }
              align="right"
            >
              <DropdownItem
                icon={<Edit3 className="h-4 w-4" />}
                onSelect={() => { setOpenId(null); onEdit(med.id); }}
              >
                Editar
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                icon={<Trash2 className="h-4 w-4" />}
                danger
                onSelect={() => setOpenId(med.id)}
              >
                Eliminar
              </DropdownItem>
            </Dropdown>
            <Modal
              open={openId === med.id}
              onClose={() => setOpenId(null)}
              title="Eliminar medicamento"
              description={`¿Estás seguro de que quieres eliminar "${med.name}"? Esta acción no se puede deshacer.`}
              size="sm"
              footer={
                <>
                  <Button variant="ghost" onClick={() => setOpenId(null)}>Cancelar</Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      remove.mutate(med.id);
                      setOpenId(null);
                    }}
                    loading={remove.isPending}
                  >
                    Eliminar
                  </Button>
                </>
              }
            />
          </div>
        ))}
      </div>
      {medications.length === 0 && (
        <p className="py-8 text-center text-sm text-secondary">
          No tienes medicamentos registrados. Añade tu primero con el botón de arriba.
        </p>
      )}
    </section>
  );
}
