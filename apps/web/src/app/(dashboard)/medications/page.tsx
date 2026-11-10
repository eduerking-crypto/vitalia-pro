"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMedications } from "@/hooks/use-medications";
import { MedicationList } from "@/components/medications/medication-list";
import { MedicationForm } from "@/components/medications/medication-form";
import { Modal } from "@/components/ui";
import { InteractionAlert } from "@/components/medications/interaction-alert";
import { AdherenceChart } from "@/components/medications/adherence-chart";
import { Badge, SkeletonCard } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MedicationsPage() {
  const { data: medications, isLoading } = useMedications();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string } | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Medicamentos</h1>
          <p className="text-sm text-secondary">
            Tus tratamientos, tomas, adherencia y alertas de interacción.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Añadir medicamento
        </Button>
      </header>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          <InteractionAlert />
          <AdherenceChart />
          <MedicationList
            medications={medications ?? []}
            onEdit={(id) => { setEditing({ id }); setOpen(true); }}
          />
        </>
      )}

      <MedicationForm
        open={open}
        onClose={() => setOpen(false)}
        medication={editing?.id ? (medications ?? []).find((m) => m.id === editing.id) ?? undefined : undefined}
      />
    </div>
  );
}
