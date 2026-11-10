"use client";

import { Activity, Droplets, Footprints, Moon } from "lucide-react";
import { useSleep, useVitals } from "@/hooks/use-health";
import { useHealthStore, waterMl } from "@/stores/use-health-store";
import { STEPS_DAILY_GOAL } from "@/lib/constants";
import { CircularProgress, Skeleton } from "@/components/ui";
import { formatMinutesAsHours, percent } from "@/lib/utils";

function StatCard({
  icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="card-surface flex items-center gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-secondary">{label}</p>
        <p className="truncate text-xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-secondary">{detail}</p>
      </div>
    </div>
  );
}

/** Cuadrícula de métricas clave del día: pasos, sueño, FC e hidratación. */
export function StatsGrid() {
  const { data: sleep, isLoading: sleepLoading } = useSleep(7);
  const { data: vitals, isLoading: vitalsLoading } = useVitals(7);
  const { steps, stepsGoal, waterGlasses } = useHealthStore();

  const avgSleepMinutes = sleep?.length
    ? Math.round(sleep.reduce((acc, s) => acc + s.duration_minutes, 0) / sleep.length)
    : 0;
  const restingHr = vitals?.length
    ? Math.round([...vitals].sort((a, b) => a.heart_rate - b.heart_rate)[0]?.heart_rate ?? 0)
    : 0;
  const lastVital = vitals?.[vitals.length - 1];

  if (sleepLoading || vitalsLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<Footprints className="h-5 w-5 text-sage-600 dark:text-sage-300" />}
        label="Pasos hoy"
        value={steps.toLocaleString("es-ES")}
        detail={`Meta: ${stepsGoal.toLocaleString("es-ES")} · ${percent(steps, stepsGoal)}%`}
        accent="bg-sage-100 dark:bg-sage-700/30"
      />
      <StatCard
        icon={<Moon className="h-5 w-5 text-serene-600 dark:text-serene-300" />}
        label="Sueño (media 7 días)"
        value={formatMinutesAsHours(avgSleepMinutes)}
        detail={`Anoche: ${sleep?.[sleep.length - 1] ? formatMinutesAsHours(sleep[sleep.length - 1]!.duration_minutes) : "—"}`}
        accent="bg-serene-100 dark:bg-serene-700/30"
      />
      <StatCard
        icon={<Activity className="h-5 w-5 text-danger" />}
        label="FC en reposo"
        value={restingHr ? `${restingHr} lpm` : "—"}
        detail={lastVital ? `Última TA: ${lastVital.systolic_bp}/${lastVital.diastolic_bp} mmHg` : "Sin datos"}
        accent="bg-red-100 dark:bg-red-700/30"
      />
      <StatCard
        icon={<Droplets className="h-5 w-5 text-info" />}
        label="Hidratación"
        value={`${(waterMl(waterGlasses) / 1000).toFixed(2).replace(".", ",")} L`}
        detail={`${waterGlasses} vasos · meta 2 L`}
        accent="bg-blue-100 dark:bg-blue-700/30"
      />
    </div>
  );
}

/** Anillo compacto de pasos usados en tarjetas. */
export function StepsRing() {
  const { steps, stepsGoal } = useHealthStore();
  return (
    <CircularProgress
      value={steps}
      max={stepsGoal || STEPS_DAILY_GOAL}
      size={72}
      strokeWidth={7}
      label={percent(steps, stepsGoal || STEPS_DAILY_GOAL).toString()}
      sublabel="%"
    />
  );
}
