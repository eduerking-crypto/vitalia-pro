"use client";

import { Bot, CheckCircle2 } from "lucide-react";
import { useMealMutations } from "@/hooks/use-meals";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { MealInput, NutritionSuggestion } from "@/types/meal";

interface AiSuggestionsProps {
  suggestions: NutritionSuggestion[];
  onAdd: (meal: Omit<MealInput, "user_id" | "image_url">) => void;
}

export function AiSuggestions({ suggestions, onAdd }: AiSuggestionsProps) {
  const { create } = useMealMutations();

  if (suggestions.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-sage-600 dark:bg-neutral-800 dark:text-sage-300">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="text-sm font-semibold">Sugerencias del asistente IA</h2>
      </div>
      <div className="grid gap-3">
        {suggestions.map((s) => (
          <Card key={s.id} className="p-4">
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
              <p className="text-xs text-secondary mt-1">{s.reason}</p>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-3">
              <div className="text-sm space-y-1">
                <p className="tabular-nums">{s.calories} kcal</p>
                <p className="text-xs text-secondary tabular-nums">
                  {s.protein_g}g P · {s.carbs_g}g C · {s.fat_g}g F
                </p>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  onAdd({
                    date: new Date().toISOString().slice(0, 10),
                    meal_type: s.meal_type,
                    food_name: s.title,
                    calories: s.calories,
                    protein_g: s.protein_g,
                    carbs_g: s.carbs_g,
                    fat_g: s.fat_g,
                    fiber_g: 0,
                    notes: `Sugerencia IA: ${s.reason}`,
                  } as MealInput)
                }
                type="button"
              >
                Añadir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
