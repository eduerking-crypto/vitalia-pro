"use client";

import { Stethoscope, BookOpen, HeartPulse, Sparkles, Brain, Flower2, Baby, FlaskConical, Apple } from "lucide-react";
import { useSpecialties } from "@/hooks/use-appointments";
import { Button, Card, CardContent, CardHeader, CardTitle, SkeletonCard } from "@/components/ui";
import type { Specialty } from "@/types/appointment";

const ICONS: Record<string, React.ElementType> = {
  familiar: Stethoscope,
  cardiologia: HeartPulse,
  endocrinologia: FlaskConical,
  nutricion: Apple,
  dermatologia: Sparkles,
  psicologia: Brain,
  ginecologia: Flower2,
  pediatria: Baby,
};

interface SpecialtyGridProps {
  onRequest: () => void;
}

export function SpecialtyGrid({ onRequest }: SpecialtyGridProps) {
  const { data: specialties, isLoading } = useSpecialties();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const list: Specialty[] = specialties ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold">Especialidades disponibles</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const Icon = ICONS[s.id] ?? BookOpen;
          return (
            <Card key={s.id} className="p-4">
              <CardHeader>
                <CardTitle>{s.name}</CardTitle>
                <p className="text-xs text-secondary">{s.description}</p>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex items-center justify-between text-sm text-secondary space-y-2">
                  <span>
                    {s.doctors_available} especialista{s.doctors_available !== 1 ? "s" : ""} disponible{s.doctors_available !== 1 ? "s" : ""}
                  </span>
                  <span>Próxima cita: {new Date(s.next_available).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                </div>
                <Button
                  size="sm"
                  onClick={onRequest}
                  className="w-full mt-3"
                >
                  Pedir cita con <span className="font-medium">{s.name}</span>
                </Button>
              </CardContent>
              <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 text-sage-600 dark:bg-neutral-800 dark:text-sage-300">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
