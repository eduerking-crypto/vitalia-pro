"use client";

import { Trash2 } from "lucide-react";
import { useMealMutations } from "@/hooks/use-meals";
import { Button, Badge } from "@/components/ui";
import { formatTimeHM } from "@/lib/utils";
import type { Meal } from "@/types/meal";

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Snack",
};

interface MealDiaryProps {
  meals: Meal[];
  date: string;
}

export function MealDiary({ meals, date }: MealDiaryProps) {
  const { remove } = useMealMutations();

  const byType = meals.reduce<Record<string, Meal[]>>((acc, m) => {
    acc[m.meal_type] = [...(acc[m.meal_type] ?? []), m];
    return acc;
  }, {});

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold">Diario de comidas</h2>
      <div className="space-y-5">
        {["breakfast", "lunch", "dinner", "snack"].map((type) => {
          const items = byType[type] ?? [];
          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-700 text-[10px] font-semibold uppercase">
                  {MEAL_TYPE_LABELS[type]}
                </span>
                <span className="text-xs text-secondary">
                  {items.reduce((acc, m) => acc + m.calories, 0)} kcal
                </span>
              </div>
              <div className="space-y-2">
                {items.length === 0 && (
                  <p className="text-xs text-secondary italic">Sin comidas registradas</p>
                )}
                {items.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[color:var(--color-border)] bg-white dark:bg-neutral-900/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{meal.food_name}</p>
                      <p className="text-xs text-secondary tabular-nums">
                        {meal.protein_g}g P · {meal.carbs_g}g C · {meal.fat_g}g F
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove.mutate({ id: meal.id, date })}
                      aria-label={`Eliminar ${meal.food_name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
