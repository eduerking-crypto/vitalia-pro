"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMedicationAdherence } from "@/hooks/use-medications";
import { Card, CardContent, CardHeader, CardTitle, CircularProgress } from "@/components/ui";
import { percent } from "@/lib/utils";

export function AdherenceChart() {
  const { data: adherence, isLoading } = useMedicationAdherence(30);

  if (isLoading) return <SkeletonCard />;
  if (!adherence) return null;

  const data = [
    { name: "Tomadas", value: adherence.taken_doses, color: "#6b8c5c" },
    { name: "Pendientes", value: adherence.expected_doses - adherence.taken_doses - adherence.skipped_doses - adherence.late_doses, color: "#e5e7eb" },
    { name: "Saltadas", value: adherence.skipped_doses, color: "#f59e0b" },
    { name: "Tardías", value: adherence.late_doses, color: "#dc2626" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adherencia al tratamiento (30 días)</CardTitle>
        <p className="text-sm text-secondary">
          {adherence.adherence_rate}% de {adherence.expected_doses} tomas esperadas
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-6">
          <CircularProgress value={adherence.adherence_rate} max={100} size={96} label={`${adherence.adherence_rate}%`} sublabel="adherencia" color={adherence.adherence_rate >= 80 ? "success" : "warning"} />
          <ul className="min-w-0 space-y-2">
            {[
              { label: "Tomadas", value: adherence.taken_doses },
              { label: "Saltadas", value: adherence.skipped_doses },
              { label: "Tardías", value: adherence.late_doses },
            ].map((item) => (
              <li key={item.label} className="flex justify-between text-sm">
                <span className="text-secondary">{item.label}</span>
                <span className="font-medium tabular-nums">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="h-40" role="img" aria-label="Desglose de tomas en los últimos 30 días">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="text-neutral-300 dark:text-neutral-700" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(value: number | string) => [`${Number(value).toLocaleString("es-ES")}`, "Tomas"]}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#87A878" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <div className="card-surface p-5 flex items-center gap-4" aria-hidden="true">
      <div className="h-10 w-10 rounded-lg bg-sage-100/80 dark:bg-neutral-800" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 bg-sage-100/80 dark:bg-neutral-800" />
        <div className="h-3 w-1/3 bg-sage-100/80 dark:bg-neutral-800" />
      </div>
    </div>
  );
}
