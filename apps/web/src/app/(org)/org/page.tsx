"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  HeartPulse,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle, ProgressBar, SkeletonCard } from "@/components/ui";
import { useOrgAudit, useOrgSummary } from "@/hooks/use-org";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "sage",
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
  tone?: "sage" | "serene" | "warning" | "danger";
}) {
  const tones: Record<string, string> = {
    sage: "bg-sage-100 text-sage-700 dark:bg-sage-700/30 dark:text-sage-200",
    serene: "bg-serene-100 text-serene-700 dark:bg-serene-700/30 dark:text-serene-200",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-200",
    danger: "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-200",
  };
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-secondary">{hint}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

export default function OrgDashboardPage() {
  const { data, isLoading } = useOrgSummary();
  const { data: audit } = useOrgAudit();

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const maxRisk = Math.max(...data.risk_distribution.map((r) => r.value), 1);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.header variants={item} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-serene-600">
            {data.organization.sector} · {data.organization.city}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">
            {data.organization.name}
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Panel de control asistencial · plan {data.organization.plan} · {data.organization.seats} cupos
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/org/pacientes"
            className="inline-flex items-center gap-2 rounded-lg bg-serene-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-serene-700"
          >
            Ver pacientes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/org/reportes"
            className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            Reportes
          </Link>
        </div>
      </motion.header>

      {data.high_risk > 0 && (
        <motion.div variants={item}>
          <Alert variant="warning" title="Pacientes que requieren seguimiento">
            {data.high_risk} paciente(s) en riesgo alto y {data.alerts} alertas activas de adherencia.
            Revisa la lista priorizada en <Link href="/org/pacientes" className="underline">Pacientes</Link>.
          </Alert>
        </motion.div>
      )}

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Pacientes activos"
          value={String(data.patients_total)}
          hint={`${data.active_patients_7d} con datos esta semana`}
          icon={Users}
          tone="serene"
        />
        <KpiCard
          label="Adherencia media"
          value={`${data.adherence_rate}%`}
          hint="Últimos 30 días"
          icon={TrendingUp}
          tone="sage"
        />
        <KpiCard
          label="Citas esta semana"
          value={String(data.appointments_week)}
          hint="Agenda de los próximos 7 días"
          icon={CalendarCheck}
          tone="serene"
        />
        <KpiCard
          label="Riesgo alto"
          value={String(data.high_risk)}
          hint={`${data.alerts} alertas activas`}
          icon={AlertTriangle}
          tone={data.high_risk > 0 ? "danger" : "sage"}
        />
      </motion.div>

      <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Adherencia por semana</CardTitle>
            <p className="text-sm text-secondary">Porcentaje de tomas correctas (últimas 6 semanas)</p>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full" role="img" aria-label="Evolución semanal de la adherencia">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.adherence_series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="orgAdherence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4A6fa5" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#4A6fa5" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-neutral-300 dark:text-neutral-700" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={44} domain={[0, 100]} />
                  <Tooltip
                    formatter={(v: number | string) => [`${Number(v)}%`, "Adherencia"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4A6fa5" strokeWidth={2.5} fill="url(#orgAdherence)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consultas por semana</CardTitle>
            <p className="text-sm text-secondary">Citas agendadas en la organización</p>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full" role="img" aria-label="Consultas agendadas por semana">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.consultations_series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-neutral-300 dark:text-neutral-700" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={44} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: number | string) => [`${Number(v)} citas`, "Consultas"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13 }}
                  />
                  <Bar dataKey="value" fill="#87A878" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribución de riesgo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.risk_distribution.map((r) => (
              <div key={r.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{r.label}</span>
                  <span className="text-secondary">{r.value}</span>
                </div>
                <ProgressBar
                  value={(r.value / maxRisk) * 100}
                  color={r.label === "Alto" ? "danger" : r.label === "Medio" ? "warning" : "sage"}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Actividad reciente</CardTitle>
            <Badge variant="neutral">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Auditoría
            </Badge>
          </CardHeader>
          <CardContent>
            {!audit || audit.length === 0 ? (
              <p className="py-6 text-center text-sm text-secondary">
                Sin eventos recientes en la organización.
              </p>
            ) : (
              <ul className="divide-y divide-[color:var(--color-border)]">
                {audit.slice(0, 6).map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-sage-500" aria-hidden="true" />
                      <span className="font-medium">{entry.actor_name ?? "Sistema"}</span>
                      <span className="text-secondary">{entry.action.replaceAll("_", " ")}</span>
                    </span>
                    <span className="shrink-0 text-xs text-secondary">
                      {new Date(entry.timestamp).toLocaleString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-3">
        <Link href="/org/pacientes" className="group">
          <Card className="h-full transition-shadow hover:shadow-card">
            <CardContent className="flex items-center gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-serene-100 text-serene-700">
                <Users className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">Pacientes</p>
                <p className="text-xs text-secondary">Riesgo, adherencia y signos vitales</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-secondary transition-transform group-hover:translate-x-0.5" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/org/agenda" className="group">
          <Card className="h-full transition-shadow hover:shadow-card">
            <CardContent className="flex items-center gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">Agenda</p>
                <p className="text-xs text-secondary">Citas y teleconsulta</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-secondary transition-transform group-hover:translate-x-0.5" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/org/reportes" className="group">
          <Card className="h-full transition-shadow hover:shadow-card">
            <CardContent className="flex items-center gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Activity className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">Reportes</p>
                <p className="text-xs text-secondary">Adherencia y cohortes</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-secondary transition-transform group-hover:translate-x-0.5" />
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
