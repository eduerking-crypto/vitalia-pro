"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Award, Footprints, Timer, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useHealthStore } from "@/stores/use-health-store";
import { STEPS_DAILY_GOAL } from "@/lib/constants";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, CircularProgress } from "@/components/ui";
import { percent } from "@/lib/utils";

const activitySchema = z.object({
  steps: z.coerce.number().int().min(1, "Introduce tus pasos").max(100000),
  activeMinutes: z.coerce.number().int().min(0).max(600),
});
type ActivityForm = z.infer<typeof activitySchema>;

export default function ActivityPage() {
  const { steps, stepsGoal, activeMinutes, weekSteps, logActivity, setStepsGoal, ensureToday } =
    useHealthStore();
  ensureToday();
  const [goalDraft, setGoalDraft] = useState(String(stepsGoal || STEPS_DAILY_GOAL));

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: { steps: 2000, activeMinutes: 20 },
  });

  const today = new Date();
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = format(d, "yyyy-MM-dd");
    return {
      day: format(d, "EEE d", { locale: es }),
      steps: i === 6 ? steps : weekSteps[key] ?? 0,
    };
  });

  const goal = stepsGoal || STEPS_DAILY_GOAL;
  const distanceKm = ((steps * 0.75) / 1000).toFixed(2).replace(".", ",");
  const weekTotal = data.reduce((a, d) => a + d.steps, 0);
  const weekAvg = Math.round(weekTotal / 7);
  const bestDay = Math.max(...data.map((d) => d.steps), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Actividad</h1>
        <p className="text-sm text-secondary">
          Cada paso suma: 150 min semanales de actividad moderada reducen el riesgo cardiovascular.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pasos de hoy</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <CircularProgress
              value={steps}
              max={goal}
              size={116}
              label={`${percent(steps, goal)}%`}
              sublabel="meta"
            />
            <div className="space-y-1.5">
              <p className="text-2xl font-bold tabular-nums">{steps.toLocaleString("es-ES")}</p>
              <p className="text-sm text-secondary">de {goal.toLocaleString("es-ES")} pasos</p>
              <p className="text-sm font-medium text-sage-600 dark:text-sage-300">
                ≈ {distanceKm} km · {activeMinutes} min activos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Registrar actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((values) => {
                logActivity(values.steps, values.activeMinutes);
                reset();
              })}
              className="flex flex-wrap items-end gap-4"
              noValidate
            >
              <div className="min-w-40 flex-1">
                <Input label="Pasos añadidos" error={errors.steps?.message} {...register("steps")} />
              </div>
              <div className="min-w-40 flex-1">
                <Input
                  label="Minutos activos"
                  error={errors.activeMinutes?.message}
                  {...register("activeMinutes")}
                />
              </div>
              <Button type="submit" className="h-11">
                <Footprints className="h-4 w-4" aria-hidden="true" />
                Añadir
              </Button>
            </form>
            <div className="mt-4 flex items-center gap-2 text-sm text-secondary">
              <label htmlFor="steps-goal">Meta diaria:</label>
              <select
                id="steps-goal"
                value={goalDraft}
                onChange={(e) => {
                  setGoalDraft(e.target.value);
                  setStepsGoal(Number(e.target.value));
                }}
                className="h-9 rounded-lg border border-[color:var(--color-border)] bg-white px-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
              >
                {[5000, 6000, 8000, 10000, 12000].map((g) => (
                  <option key={g} value={g}>{g.toLocaleString("es-ES")} pasos</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pasos de la semana</CardTitle>
          <p className="text-sm text-secondary">
            Total: {weekTotal.toLocaleString("es-ES")} · Media: {weekAvg.toLocaleString("es-ES")} · Mejor día: {bestDay.toLocaleString("es-ES")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64" role="img" aria-label="Gráfico de barras de pasos por día">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" className="text-neutral-300 dark:text-neutral-700" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} width={52} />
                <Tooltip
                  formatter={(value: number | string) => [`${Number(value).toLocaleString("es-ES")}`, "Pasos"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13 }}
                />
                <ReferenceLine y={goal} stroke="#4A6fa5" strokeDasharray="6 4" label={{ value: "meta", fontSize: 11, fill: "currentColor" }} />
                <Bar dataKey="steps" fill="#87A878" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: TrendingUp, title: "Constante", description: `Media de ${weekAvg.toLocaleString("es-ES")} pasos diarios esta semana.`, unlocked: weekAvg >= 4000 },
          { icon: Timer, title: "Activo", description: `${activeMinutes} minutos de actividad registrados hoy.`, unlocked: activeMinutes >= 30 },
          { icon: Award, title: "Meta diaria", description: `Objetivo de ${goal.toLocaleString("es-ES")} pasos alcanzado.`, unlocked: steps >= goal },
        ].map((badge) => (
          <Card key={badge.title} className={badge.unlocked ? "" : "opacity-60"}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${badge.unlocked ? "bg-sage-100 text-sage-600 dark:bg-sage-700/30 dark:text-sage-300" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"}`}>
                <badge.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {badge.title} {badge.unlocked ? "🏆" : "🔒"}
                </p>
                <p className="text-xs text-secondary">{badge.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
