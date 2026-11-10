"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { MedicationInput } from "@vitalia/shared-types";
import {
  QUERY_KEYS,
} from "@/lib/constants";
import {
  createMedication,
  deleteMedication,
  fetchAdherence,
  fetchInteractions,
  fetchMedications,
  markMedicationTaken,
  updateMedication,
} from "@/lib/api/medications";
import { useMedicationStore } from "@/stores/use-medication-store";
import { toast } from "@/stores/use-notification-store";
import { apiErrorMessage } from "@/lib/utils";

export function useMedications() {
  return useQuery({
    queryKey: QUERY_KEYS.medications,
    queryFn: fetchMedications,
  });
}

export function useMedicationInteractions() {
  return useQuery({
    queryKey: QUERY_KEYS.medicationInteractions,
    queryFn: fetchInteractions,
  });
}

export function useMedicationAdherence(days = 30) {
  return useQuery({
    queryKey: [...QUERY_KEYS.medicationAdherence, days],
    queryFn: () => fetchAdherence(days),
  });
}

export function useMedicationMutations() {
  const queryClient = useQueryClient();
  const medicationStore = useMedicationStore();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.medications });

  const create = useMutation({
    mutationFn: (input: MedicationInput) => createMedication(input),
    onSuccess: (med) => {
      invalidate();
      toast.success("Medicamento añadido", `${med.name} ${med.dosage} quedó registrado.`);
    },
    onError: (error) => toast.error("No se pudo añadir", apiErrorMessage(error)),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MedicationInput> }) =>
      updateMedication(id, input),
    onSuccess: (med) => {
      invalidate();
      toast.success("Medicamento actualizado", `${med.name} quedó actualizado.`);
    },
    onError: (error) => toast.error("No se pudo actualizar", apiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMedication(id),
    onSuccess: (_data, id) => {
      invalidate();
      medicationStore.undo(id);
      toast.success("Medicamento eliminado", "Ya no aparecerá en tus tomas.");
    },
    onError: (error) => toast.error("No se pudo eliminar", apiErrorMessage(error)),
  });

  const markTaken = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "taken" | "skipped" | "late" }) =>
      markMedicationTaken(id, status).then(() => ({ id, status })),
    onSuccess: ({ id, status }) => {
      if (status === "taken") medicationStore.markTaken(id);
      else medicationStore.markSkipped(id);
      invalidate();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.medicationAdherence });
    },
    onError: (error) => toast.error("No se pudo registrar la toma", apiErrorMessage(error)),
  });

  const undoTaken = (id: string) => {
    medicationStore.undo(id);
    invalidate();
  };

  return { create, update, remove, markTaken, undoTaken };
}
