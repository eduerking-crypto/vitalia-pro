"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useHealthStore } from "@/stores/use-health-store";
import { STEPS_DAILY_GOAL } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

/** Gráfico de área con los pasos de la última semana. */
export function ActivityChart() {
  const { steps, stepsGoal, weekSteps } = useHealthStore();

  const today = new Date();
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = format(d, "yyyy-MM-dd");
    const value = i === 6 ? steps : weekSteps[key] ?? 0;
    return {
      day: format(d, "EEE d", { locale: es }),
      steps: value,
      goal: stepsGoal || STEPS_DAILY_GOAL,
    };
  });

  const weekTotal = data.reduce((acc, d) => acc + d.steps, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Actividad de la semana</CardTitle>
          <p className="text-sm text-secondary">
            {weekTotal.toLocaleString("es-ES")} pasos en total · meta diaria{" "}
            {(stepsGoal || STEPS_DAILY_GOAL).toLocaleString("es-ES")}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full" role="img" aria-label="Gráfico de pasos diarios de la última semana">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#87A878" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#87A878" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="text-neutral-300 dark:text-neutral-700" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} width={48} />
              <Tooltip
                formatter={(value: number | string) => [`${Number(value).toLocaleString("es-ES")} pasos`, "Pasos"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="steps"
                stroke="#87A878"
                strokeWidth={2.5}
                fill="url(#stepsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
