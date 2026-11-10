"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus } from "lucide-react";
import { useMedicationMutations } from "@/hooks/use-medications";
import { Modal } from "@/components/ui";
import { Button, Input, Select, Textarea, Toggle } from "@/components/ui";
import type { Medication, MedicationInput } from "@/types/medication";

const FREQUENCY_OPTIONS: Array<{ value: MedicationInput["frequency"]; label: string }> = [
  { value: "once_daily", label: "Una vez al día" },
  { value: "twice_daily", label: "Dos veces al día" },
  { value: "three_times_daily", label: "Tres veces al día" },
  { value: "every_8h", label: "Cada 8 horas" },
  { value: "every_12h", label: "Cada 12 horas" },
  { value: "as_needed", label: "Según necesidad" },
  { value: "weekly", label: "Semanal" },
];

const schema = z.object({
  name: z.string().min(2, "Indica el nombre del medicamento"),
  active_ingredient: z.string().min(2, "Indica el principio activo"),
  dosage: z.string().min(1, "Indica la dosis"),
  frequency: z.string(),
  time: z.string().min(1, "Indica la hora"),
  instructions: z.string().optional(),
  start_date: z.string().min(1, "Indica la fecha de inicio"),
  end_date: z.string().nullable().optional(),
  reminder_enabled: z.boolean().optional(),
  remaining_quantity: z.coerce.number().int().min(0).optional(),
  prescribed_by: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface MedicationFormProps {
  open: boolean;
  onClose: () => void;
  medication?: Medication;
}

export function MedicationForm({ open, onClose, medication }: MedicationFormProps) {
  const { create, update } = useMedicationMutations();
  const isEdit = Boolean(medication);
  const [stock, setStock] = useState(medication?.remaining_quantity ?? 30);

  const defaultValues: FormValues = {
    name: medication?.name ?? "",
    active_ingredient: medication?.active_ingredient ?? "",
    dosage: medication?.dosage ?? "",
    frequency: (medication?.frequency ?? "once_daily") as FormValues["frequency"],
    time: medication?.time ?? "08:00",
    instructions: medication?.instructions ?? "",
    start_date: medication?.start_date ?? new Date().toISOString().slice(0, 10),
    end_date: medication?.end_date ?? null,
    reminder_enabled: medication?.reminder_enabled ?? true,
    remaining_quantity: medication?.remaining_quantity ?? 0,
    prescribed_by: medication?.prescribed_by ?? "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  // Sincroniza valores al editar un medicamento distinto.
  useEffect(() => {
    if (medication) {
      reset({
        ...defaultValues,
        reminder_enabled: medication.reminder_enabled,
        remaining_quantity: medication.remaining_quantity,
      });
      setStock(medication.remaining_quantity);
    }
  }, [medication, reset, setStock]);

  const submit = (values: FormValues) => {
    const payload: MedicationInput = {
      name: values.name,
      active_ingredient: values.active_ingredient,
      dosage: values.dosage,
      frequency: values.frequency as MedicationInput["frequency"],
      time: values.time,
      instructions: values.instructions ?? "",
      start_date: values.start_date,
      end_date: values.end_date ?? null,
      reminder_enabled: values.reminder_enabled ?? true,
      remaining_quantity: values.remaining_quantity ?? 0,
      prescribed_by: values.prescribed_by ?? "",
    };
    if (isEdit && medication) {
      update.mutate({ id: medication.id, input: payload }, {
        onSuccess: () => onClose(),
      });
    } else {
      create.mutate(payload, { onSuccess: () => onClose() });
    }
  };

  const reminderEnabled = watch("reminder_enabled", defaultValues.reminder_enabled);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar medicamento" : "Nuevo medicamento"}
      description={isEdit ? "Actualiza los datos de tu tratamiento." : "Rellena los datos de tu medicación."}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit(submit)} loading={create.isPending || update.isPending}>
            {isEdit ? "Guardar cambios" : "Añadir medicamento"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4" noValidate>
        <Input label="Nombre del medicamento" error={errors.name?.message} {...register("name")} />
        <Input label="Principio activo" error={errors.active_ingredient?.message} {...register("active_ingredient")} />
        <Input label="Dosis" placeholder="Ej. 500 mg" error={errors.dosage?.message} {...register("dosage")} />
        <Select
          label="Frecuencia"
          error={errors.frequency?.message}
          {...register("frequency")}
        >
          {FREQUENCY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Input label="Hora de toma" type="time" error={errors.time?.message} {...register("time")} />
        <Input label="Fecha de inicio" type="date" error={errors.start_date?.message} {...register("start_date")} />
        <Input label="Fecha de fin (opcional)" type="date" error={errors.end_date?.message} {...register("end_date")} />
        <div className="sm:col-span-2">
          <Textarea
            label="Instrucciones"
            placeholder="Ej. Tomar con el desayuno. No consumir alcohol."
            error={errors.instructions?.message}
            {...register("instructions")}
            rows={2}
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Toggle
            checked={Boolean(reminderEnabled)}
            onChange={(v) => setValue("reminder_enabled", v)}
            label="Activar recordatorio"
            description="Recibirás una notificación a la hora indicada"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <label className="text-xs font-medium text-secondary">Stock restante (comprimidos)</label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setStock((s) => Math.max(0, s - 1))} disabled={stock <= 0}>
              <Minus className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Input
              type="number"
              value={stock}
              onChange={(e) => {
                const n = Math.max(0, Number(e.target.value) || 0);
                setStock(n);
                setValue("remaining_quantity", n);
              }}
              className="w-20 text-center"
            />
            <Button variant="outline" size="sm" onClick={() => {
              const n = stock + 1;
              setStock(n);
              setValue("remaining_quantity", n);
            }}>
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          {stock < 10 && <span className="ml-2 text-xs font-medium text-warning">Stock bajo</span>}
        </div>
        <Input label="Recetado por (opcional)" error={errors.prescribed_by?.message} {...register("prescribed_by")} />
      </form>
    </Modal>
  );
}
