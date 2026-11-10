"use client";

import { useGoals } from "@/hooks/use-meals";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { DailySummary } from "@/types/meal";

const GOAL_DEFAULTS = { protein_g: 120, carbs_g: 220, fat_g: 65 };

interface MacroBarsProps {
  summary: Pick<DailySummary, "total_protein_g" | "total_carbs_g" | "total_fat_g">;
}

export function MacroBars({ summary }: MacroBarsProps) {
  const { data: goals } = useGoals();
  const proteinGoal = goals?.protein_g ?? GOAL_DEFAULTS.protein_g;
  const carbsGoal = goals?.carbs_g ?? GOAL_DEFAULTS.carbs_g;
  const fatGoal = goals?.fat_g ?? GOAL_DEFAULTS.fat_g;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Macronutrientes del día</CardTitle>
        <p className="text-sm text-secondary">Objetivos diarios personalizables en Ajustes.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <MacroRow label="Proteína" value={summary.total_protein_g} goal={proteinGoal} unit="g" color="serene" />
        <MacroRow label="Carbohidratos" value={summary.total_carbs_g} goal={carbsGoal} unit="g" color="sage" />
        <MacroRow label="Grasas" value={summary.total_fat_g} goal={fatGoal} unit="g" color="serene" />
      </CardContent>
    </Card>
  );
}

function MacroRow({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: "sage" | "serene" }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-secondary">{value}{unit} / {goal}{unit}</span>
      </div>
      <ProgressBar value={value} max={goal} showValue color={color} size="sm" />
    </div>
  );
}
