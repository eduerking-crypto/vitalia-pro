"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Info, ShieldCheck, Sparkles } from "lucide-react";
import { isDemoMode } from "@/lib/api/client";
import { useHealthScore } from "@/hooks/use-health";
import { useAppointments } from "@/hooks/use-appointments";
import { useAuthStore } from "@/stores/use-auth-store";
import { MODALITY_LABELS } from "@/lib/constants";
import { relativeDay } from "@/lib/utils";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle, CircularProgress, ProgressBar, Skeleton, CardIcon } from "@/components/ui";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { HydrationTracker } from "@/components/dashboard/hydration-tracker";
import { MedicationSummary } from "@/components/dashboard/medication-summary";
import { ActivityChart } from "@/components/dashboard/activity-chart";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

function HealthScoreCard() {
  const { data: score, isLoading } = useHealthScore();

  if (isLoading || !score) {
    return <Skeleton className="h-64" />;
  }

  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sage-100 blur-3xl dark:bg-sage-700/20"
        aria-hidden="true"
      />
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Puntuación de salud</CardTitle>
          <p className="text-sm capitalize text-secondary">Estado: {score.label}</p>
        </div>
        <CardIcon>
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </CardIcon>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <CircularProgress
            value={score.score}
            max={100}
            size={104}
            label={String(score.score)}
            sublabel="de 100"
            color={score.score >= 75 ? "success" : score.score >= 50 ? "sage" : "warning"}
          />
          <ul className="min-w-0 flex-1 space-y-2.5">
            {score.components.slice(0, 4).map((c) => (
              <li key={c.key}>
                <ProgressBar
                  value={c.value}
                  max={100}
                  label={c.name}
                  showValue
                  size="sm"
                  color={c.value >= 75 ? "success" : c.value >= 50 ? "sage" : "warning"}
                />
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function NextAppointmentCard() {
  const { data: appointments, isLoading } = useAppointments();
  if (isLoading) return <Skeleton className="h-44" />;

  const next = appointments
    ?.filter((a) => a.status === "confirmed" || a.status === "pending")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Próxima cita</CardTitle>
        <CardIcon>
          <CalendarCheck className="h-5 w-5" aria-hidden="true" />
        </CardIcon>
      </CardHeader>
      <CardContent>
        {next ? (
          <>
            <p className="text-lg font-semibold">{next.doctor_name}</p>
            <p className="text-sm text-secondary">{next.specialty}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="sage">{relativeDay(next.date)}</Badge>
              <Badge variant="outline">{next.time}</Badge>
              <Badge variant="serene">{MODALITY_LABELS[next.modality]}</Badge>
              <Badge variant={next.status === "confirmed" ? "success" : "warning"} dot>
                {next.status === "confirmed" ? "Confirmada" : "Pendiente"}
              </Badge>
            </div>
            <Link
              href="/telemedicine"
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-serene-500 hover:underline"
            >
              Gestionar citas <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        ) : (
          <p className="text-sm text-secondary">
            No tienes citas programadas.{" "}
            <Link href="/telemedicine" className="font-medium text-serene-500 hover:underline">
              Agenda una ahora
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AiTipCard() {
  return (
    <Card className="bg-gradient-to-br from-serene-500 to-serene-600 text-white dark:from-serene-600 dark:to-serene-700">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <CardTitle className="text-white">Tu asistente de salud</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-white/85">
          Pregunta a los agentes de biología y nutrición sobre tus métricas,
          tu dieta o tus medicamentos — con contexto de tu perfil.
        </p>
        <Link
          href="/assistant"
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-semibold text-serene-600 transition-colors hover:bg-white/90"
        >
          Abrir asistente <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = (user?.name ?? "").split(" ")[0] || "bienvenido";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Hola, {firstName} 👋
        </h1>
        <p className="text-sm text-secondary">
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · Este es el resumen de tu salud hoy.
        </p>
      </header>

      {isDemoMode() && (
        <Alert variant="info" title="Modo demostración">
          La API no está disponible, así que estás viendo <strong>datos de ejemplo locales</strong>.
          Levántala con <code>docker compose up -d</code> para datos reales.
        </Alert>
      )}

      <StatsGrid />

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <HealthScoreCard />
        </motion.div>
        <motion.div variants={item}>
          <HydrationTracker />
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <MedicationSummary />
        </motion.div>
        <motion.div variants={item} className="space-y-6">
          <NextAppointmentCard />
          <AiTipCard />
        </motion.div>
      </div>

      <motion.div variants={item}>
        <ActivityChart />
      </motion.div>
    </motion.div>
  );
}
