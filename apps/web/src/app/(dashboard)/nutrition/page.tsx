"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMeals, useDailySummary, useSuggestions, useMealMutations } from "@/hooks/use-meals";
import { todayDateIso } from "@/lib/utils";
import { MealDiary } from "@/components/nutrition/meal-diary";
import { MealForm } from "@/components/nutrition/meal-form";
import { AiSuggestions } from "@/components/nutrition/ai-suggestions";
import { Modal } from "@/components/ui";
import { MacroBars } from "@/components/nutrition/macro-bars";
import { Button, SkeletonCard, Alert } from "@/components/ui";
import { CircularProgress } from "@/components/ui/progress-bar";
import type { MealInput } from "@/types/meal";

export default function NutritionPage() {
  const [date, setDate] = useState(todayDateIso());
  const [open, setOpen] = useState(false);

  const { data: meals, isLoading: mealsLoading } = useMeals(date);
  const { data: summary, isLoading: summaryLoading } = useDailySummary(date);
  const { data: suggestions } = useSuggestions();
  const { create } = useMealMutations();

  if (mealsLoading || summaryLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Nutrición</h1>
          <p className="text-sm text-secondary">
            Registro de comidas, macros y sugerencias asistidas por IA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-lg border border-[color:var(--color-border)] bg-white px-3 text-sm text-ink focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500/60 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <Button onClick={() => { setOpen(true); }}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Añadir comida
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5 space-y-4">
          <h2 className="text-sm font-semibold">Resumen del día</h2>
          <div className="flex items-center gap-6">
            <div className="flex h-72 w-72 flex-col items-center justify-center">
              <CircularProgress
                value={summary?.total_calories ?? 0}
                max={2000}
                size={96}
                label={`${summary?.total_calories ?? 0}`}
                sublabel="kcal"
              />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold tabular-nums">{summary?.total_calories ?? 0} kcal</p>
              <p className="text-sm text-secondary">
                de {summary?.meals_count ?? 0} comidas registradas
              </p>
            </div>
          </div>
          <MacroBars summary={summary ?? { total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0 }} />
        </div>
        <MealDiary meals={meals ?? []} date={date} />
      </div>

      <AiSuggestions suggestions={suggestions ?? []} onAdd={(meal) => create.mutate(meal)} />

      <MealForm open={open} onClose={() => setOpen(false)} defaultDate={date} onSuccess={() => setOpen(false)} />
    </div>
  );
}


