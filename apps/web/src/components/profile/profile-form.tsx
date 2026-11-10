"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/stores/use-notification-store";
import { apiErrorMessage } from "@/lib/utils";
import { UserRound } from "lucide-react";
import { Button, Input, Select, Alert } from "@/components/ui";

const schema = z.object({
  full_name: z.string().min(2, "Indica tu nombre completo"),
  date_of_birth: z.string().min(1, "Indica tu fecha de nacimiento"),
  biological_sex: z.enum(["male", "female", "intersex", "unspecified"]),
});
type FormValues = z.infer<typeof schema>;

const SEX_LABELS: Record<string, string> = {
  male: "Masculino",
  female: "Femenino",
  intersex: "Intersexual",
  unspecified: "No especificado",
};

interface ProfileFormProps {
  profile: any;
  onUpdate: (data: FormValues) => void;
  pending: boolean;
}

export function ProfileForm({ profile, onUpdate, pending }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      date_of_birth: profile?.date_of_birth ?? "",
      biological_sex: (profile?.biological_sex ?? "unspecified") as FormValues["biological_sex"],
    },
  });

  const submit = (values: FormValues) => {
    onUpdate(values);
    toast.success("Datos personales actualizados");
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      {profile?.email && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[color:var(--color-border)] bg-neutral-50 dark:bg-neutral-800/50">
          <span className="flex shrink-0 h-9 w-9 items-center justify-center rounded-lg bg-sage-100 text-sage-600 dark:bg-neutral-700 dark:text-sage-300">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium">{profile.email}</p>
            <p className="text-xs text-secondary">Correo de la cuenta (no editable)</p>
          </div>
        </div>
      )}
      <Input label="Nombre completo" error={errors.full_name?.message} {...register("full_name")} />
      <Input label="Fecha de nacimiento" type="date" error={errors.date_of_birth?.message} {...register("date_of_birth")} />
      <Select
        label="Sexo biológico"
        error={errors.biological_sex?.message}
        {...register("biological_sex")}
      >
        {["male", "female", "intersex", "unspecified"].map((s) => (
          <option key={s} value={s}>{SEX_LABELS[s]}</option>
        ))}
      </Select>
      <Button type="submit" loading={pending} className="w-full">Guardar cambios</Button>
    </form>
  );
}
