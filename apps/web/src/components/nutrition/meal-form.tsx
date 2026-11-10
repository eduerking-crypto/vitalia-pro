"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMealMutations } from "@/hooks/use-meals";
import { toast } from "@/stores/use-notification-store";
import { Modal } from "@/components/ui";
import { Button, Input, Select, Textarea } from "@/components/ui";
import type { MealInput } from "@/types/meal";

const schema = z.object({
  date: z.string().min(1, "Indica la fecha"),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  food_name: z.string().min(2, "Indica el nombre del alimento"),
  calories: z.coerce.number().int().min(0, "Calorías no válidas"),
  protein_g: z.coerce.number().min(0),
  carbs_g: z.coerce.number().min(0),
  fat_g: z.coerce.number().min(0),
  fiber_g: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Snack",
};

interface MealFormProps {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  onSuccess: () => void;
}

export function MealForm({ open, onClose, defaultDate, onSuccess }: MealFormProps) {
  const { create } = useMealMutations();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate,
      meal_type: "breakfast",
      food_name: "",
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      notes: "",
    },
  });

  const submit = (values: FormValues) => {
    setPending(true);
    create.mutate(values, {
      onSuccess: (meal) => {
        reset({ ...resetValues(defaultDate) });
        onSuccess();
        toast.success("Comida registrada", meal.food_name);
      },
      onError: () => {
        toast.error("No se pudo registrar la comida");
      },
      onSettled: () => setPending(false),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar comida"
      description="Añade los alimentos y sus valores nutricionales al diario de hoy."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit(submit)} loading={pending}>
            Guardar comida
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4" noValidate>
        <Input label="Fecha" type="date" error={errors.date?.message} {...register("date")} />
        <Select
          label="Tipo de comida"
          error={errors.meal_type?.message}
          {...register("meal_type")}
        >
          {["breakfast", "lunch", "dinner", "snack"].map((t) => (
            <option key={t} value={t}>{MEAL_TYPE_LABELS[t]}</option>
          ))}
        </Select>
        <Input label="Alimento" placeholder="Ej. Avena con frutos rojos" error={errors.food_name?.message} {...register("food_name")} />
        <Input label="Calorías" type="number" placeholder="0" error={errors.calories?.message} {...register("calories")} />
        <Input label="Proteína (g)" type="number" placeholder="0" error={errors.protein_g?.message} {...register("protein_g")} />
        <Input label="Carbohidratos (g)" type="number" placeholder="0" error={errors.carbs_g?.message} {...register("carbs_g")} />
        <Input label="Grasa (g)" type="number" placeholder="0" error={errors.fat_g?.message} {...register("fat_g")} />
        <Input label="Fibra (g)" type="number" placeholder="0" error={errors.fiber_g?.message} {...register("fiber_g")} />
        <div className="sm:col-span-2">
          <Textarea
            label="Notas (opcional)"
            placeholder="Ej. Desayuno rápido antes de salir"
            error={errors.notes?.message}
            {...register("notes")}
            rows={2}
          />
        </div>
      </form>
    </Modal>
  );
}

function resetValues(defaultDate: string) {
  return {
    date: defaultDate,
    meal_type: "breakfast" as const,
    food_name: "",
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    notes: "",
  };
}
