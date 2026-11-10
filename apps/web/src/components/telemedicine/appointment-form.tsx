"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSpecialties, useAppointmentMutations } from "@/hooks/use-appointments";
import { toast } from "@/stores/use-notification-store";
import { Modal } from "@/components/ui";
import { Button, Input, Select, Textarea } from "@/components/ui";
import type { AppointmentInput } from "@/types/appointment";
import { MODALITY_LABELS } from "@/lib/constants";

const schema = z.object({
  doctor_name: z.string().min(2, "Indica el nombre del doctor"),
  specialty: z.string().min(1, "Selecciona una especialidad"),
  date: z.string().min(1, "Indica la fecha"),
  time: z.string().min(1, "Indica la hora"),
  modality: z.enum(["video", "in_person"]),
  reason: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
}

export function AppointmentForm({ open, onClose }: AppointmentFormProps) {
  const { create } = useAppointmentMutations();
  const { data: specialties, isLoading } = useSpecialties();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      doctor_name: "",
      specialty: "",
      date: new Date().toISOString().slice(0, 10),
      time: "09:00",
      modality: "video",
      reason: "",
      notes: "",
    },
  });

  const submit = (values: FormValues) => {
    create.mutate(values, {
      onSuccess: () => {
        reset({ ...resetValues() });
        onClose();
        toast.success("Cita solicitada", "Queda pendiente de confirmación por el especialista.");
      },
      onError: () => toast.error("No se pudo solicitar la cita"),
    });
  };

  if (isLoading) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva cita médica"
      description="Selecciona especialidad, fecha y modalidad de la consulta."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit(submit)}>Solicitar cita</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4" noValidate>
        <Input label="Doctor (opcional)" placeholder="Ej. Dra. Carmen Solís" error={errors.doctor_name?.message} {...register("doctor_name")} />
        <Select
          label="Especialidad"
          error={errors.specialty?.message}
          {...register("specialty")}
        >
          {(specialties ?? []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="otra">Otra especialidad</option>
        </Select>
        <Input label="Fecha" type="date" error={errors.date?.message} {...register("date")} />
        <Input label="Hora" type="time" error={errors.time?.message} {...register("time")} />
        <Select
          label="Modalidad"
          error={errors.modality?.message}
          {...register("modality")}
        >
          <option value="video">Videoconsulta</option>
          <option value="in_person">Presencial</option>
        </Select>
        <div className="sm:col-span-2">
          <Textarea
            label="Motivo de la consulta"
            placeholder="Ej. Control de tensión arterial y revisión de resultados"
            error={errors.reason?.message}
            {...register("reason")}
            rows={2}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Notas adicionales (opcional)"
            placeholder="Ej. Traer análisis de sangre del mes pasado"
            error={errors.notes?.message}
            {...register("notes")}
            rows={2}
          />
        </div>
        <p className="sm:col-span-2 text-xs text-secondary">
          Las citas de videoconsulta se abren 10 minutos antes de la hora acordada.
        </p>
      </form>
    </Modal>
  );
}

function resetValues() {
  return {
    doctor_name: "",
    specialty: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    modality: "video" as const,
    reason: "",
    notes: "",
  };
}
