"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppointmentInput } from "@vitalia/shared-types";
import { QUERY_KEYS } from "@/lib/constants";
import {
  cancelAppointment,
  createAppointment,
  fetchAppointments,
  fetchSpecialties,
  updateAppointment,
} from "@/lib/api/appointments";
import { toast } from "@/stores/use-notification-store";
import { apiErrorMessage } from "@/lib/utils";

export function useAppointments() {
  return useQuery({
    queryKey: QUERY_KEYS.appointments,
    queryFn: fetchAppointments,
  });
}

export function useSpecialties() {
  return useQuery({
    queryKey: QUERY_KEYS.specialties,
    queryFn: fetchSpecialties,
  });
}

export function useAppointmentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });

  const create = useMutation({
    mutationFn: (input: AppointmentInput) => createAppointment(input),
    onSuccess: (appt) => {
      invalidate();
      toast.success(
        "Cita solicitada",
        `${appt.doctor_name} · ${appt.specialty} — pendiente de confirmación.`,
      );
    },
    onError: (error) => toast.error("No se pudo agendar", apiErrorMessage(error)),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<AppointmentInput & { status: "pending" | "confirmed" | "cancelled" | "completed" }>;
    }) => updateAppointment(id, input),
    onSuccess: (appt) => {
      invalidate();
      toast.success("Cita actualizada", `${appt.doctor_name} · ${appt.specialty}`);
    },
    onError: (error) => toast.error("No se pudo actualizar", apiErrorMessage(error)),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: () => {
      invalidate();
      toast.success("Cita cancelada");
    },
    onError: (error) => toast.error("No se pudo cancelar", apiErrorMessage(error)),
  });

  return { create, update, cancel };
}
