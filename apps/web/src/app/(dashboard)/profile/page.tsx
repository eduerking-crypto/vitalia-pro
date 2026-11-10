"use client";

import { useState } from "react";
import { UserRound, ShieldCheck, AlertTriangle } from "lucide-react";
import { fetchProfile, updateProfile } from "@/lib/api/profile";
import { fetchMedicalProfile, updateMedicalProfile, addAllergy, removeAllergy } from "@/lib/api/profile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/stores/use-notification-store";
import { apiErrorMessage } from "@/lib/utils";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Toggle } from "@/components/ui";
import { ProfileForm } from "@/components/profile/profile-form";
import { AllergyTags } from "@/components/profile/allergy-tags";
import { EmergencyCard } from "@/components/profile/emergency-card";

export default function ProfilePage() {
  const [tabId, setTabId] = useState("personal");
  const queryClient = useQueryClient();

  const { data: profile, isLoading: pLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });
  const { data: medical, isLoading: mLoading } = useQuery({
    queryKey: ["medical"],
    queryFn: fetchMedicalProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { full_name?: string; date_of_birth?: string; biological_sex?: string }) =>
      updateProfile(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil actualizado");
    },
    onError: (e) => toast.error("No se pudo actualizar", apiErrorMessage(e)),
  });

  const updateMedicalMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => updateMedicalProfile(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical"] });
      toast.success("Perfil médico actualizado");
    },
    onError: (e) => toast.error("No se pudo actualizar", apiErrorMessage(e)),
  });

  const addAllergyMutation = useMutation({
    mutationFn: (data: { allergen: string; severity: string; reaction: string }) => addAllergy({ ...data, severity: data.severity as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical"] });
      toast.success("Alergia añadida");
    },
    onError: (e) => toast.error("No se pudo añadir la alergia", apiErrorMessage(e)),
  });

  const removeAllergyMutation = useMutation({
    mutationFn: (id: string) => removeAllergy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical"] });
      toast.success("Alergia eliminada");
    },
  });

  if (pLoading || mLoading) return <SkeletonCard />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Perfil médico</h1>
        <p className="text-sm text-secondary">
          Tus datos personales, historial médico y credencial de emergencia.
        </p>
      </header>

      <Tabs
        items={[
          {
            id: "personal",
            label: "Datos personales",
            icon: <UserRound className="h-4 w-4" aria-hidden="true" />,
            content: <ProfileForm profile={profile} onUpdate={updateProfileMutation.mutate} pending={updateProfileMutation.isPending} />,
          },
          {
            id: "medical",
            label: "Perfil médico",
            icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
            content: (
              <>
                <MedicalForm medical={medical ?? {}} onUpdate={updateMedicalMutation.mutate} pending={updateMedicalMutation.isPending} />
                <AllergyTags allergies={medical?.allergies ?? []} onAdd={addAllergyMutation.mutate} onRemove={removeAllergyMutation.mutate} />
                <EmergencyCard medical={medical} />
              </>
            ),
          },
        ]}
        defaultTabId="personal"
      />
    </div>
  );
}

function MedicalForm({ medical, onUpdate, pending }: { medical: any; onUpdate: (d: any) => void; pending: boolean }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Datos físicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Grupo sanguíneo"
            defaultValue={medical?.blood_type ?? ""}
            disabled
            className="bg-neutral-100 dark:bg-neutral-800"
          />
          <Input
            label="Altura (cm)"
            type="number"
            defaultValue={String(medical?.height_cm ?? "")}
            onChange={(e) => onUpdate({ ...medical, height_cm: Number(e.target.value) || undefined })}
          />
          <Input
            label="Peso (kg)"
            type="number"
            defaultValue={String(medical?.weight_kg ?? "")}
            onChange={(e) => onUpdate({ ...medical, weight_kg: Number(e.target.value) || undefined })}
          />
          {medical?.height_cm && medical?.weight_kg && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary">IMC:</span>
              <span className="text-sm font-medium">
                {(medical.weight_kg / ((medical.height_cm / 100) ** 2)).toFixed(1)}
              </span>
            </div>
          )}
          <Button onClick={() => onUpdate(medical)} loading={pending} className="w-full">Guardar cambios físicos</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Condiciones y antecedentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(medical?.chronic_conditions ?? []).map((c: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 text-sage-700 px-2.5 py-1 text-xs dark:bg-neutral-800 dark:text-sage-300">
                {c}
              </span>
            ))}
          </div>
          <p className="text-xs text-secondary">Añade condiciones crónicas desde la ficha médica completa.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {(medical?.family_history ?? []).map((h: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 text-neutral-600 px-2.5 py-1 text-xs dark:bg-neutral-800 dark:text-neutral-300">
                {h}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card-surface p-6" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sage-100/80 dark:bg-neutral-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 bg-sage-100/80 dark:bg-neutral-800" />
          <div className="h-3 w-1/3 bg-sage-100/80 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}
