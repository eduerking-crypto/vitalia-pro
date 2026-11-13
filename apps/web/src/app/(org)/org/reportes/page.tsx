"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, SkeletonCard } from "@/components/ui";
import { useOrgReport } from "@/hooks/use-org";

function BarPanel({
  title,
  subtitle,
  data,
  color,
  suffix,
}: {
  title: string;
  subtitle: string;
  data: { label: string; value: number }[];
  color: string;
  suffix?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-secondary">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full" role="img" aria-label={title}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-neutral-300 dark:text-neutral-700" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={54} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                formatter={(v: number | string) => [`${Number(v)}${suffix ?? ""}`, title]}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13 }}
              />
              <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrgReportsPage() {
  const { data, isLoading } = useOrgReport();

  if (isLoading || !data) return <SkeletonCard />;

  const maxCondition = Math.max(...data.top_conditions.map((c) => c.value), 1);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Reportes</h1>
        <p className="mt-1 text-sm text-secondary">
          Indicadores agregados de la organización para dirección médica y auditoría.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Adherencia media</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{data.avg_adherence}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">TA sistólica media</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {data.avg_systolic} <span className="text-sm font-medium text-secondary">mmHg</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Glucosa media</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {data.avg_glucose} <span className="text-sm font-medium text-secondary">mg/dL</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarPanel
          title="Adherencia por profesional"
          subtitle="Porcentaje medio de sus pacientes"
          data={data.adherence_by_professional}
          color="#4A6fa5"
          suffix="%"
        />
        <BarPanel
          title="Pacientes por cohorte"
          subtitle="Segmentación clínica"
          data={data.patients_by_cohort}
          color="#87A878"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Condiciones más frecuentes</CardTitle>
          <p className="text-sm text-secondary">Basado en las fichas médicas de los pacientes</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.top_conditions.length === 0 && (
            <p className="text-sm text-secondary">Sin condiciones registradas.</p>
          )}
          {data.top_conditions.map((c) => (
            <div key={c.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{c.label}</span>
                <span className="text-secondary">{c.value} pacientes</span>
              </div>
              <ProgressBar value={(c.value / maxCondition) * 100} color="serene" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
