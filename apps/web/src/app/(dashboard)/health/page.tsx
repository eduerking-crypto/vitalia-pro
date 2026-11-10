"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HeartPulse,
  Moon,
  Plus,
  Smile,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useHealthMutations, useHealthScore, useMood, useSleep, useVitals } from "@/hooks/use-health";
import { Button, CircularProgress, Input, Modal, SkeletonCard, Tabs, Textarea } from "@/components/ui";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatMinutesAsHours } from "@/lib/utils";

/* ---------- esquema de vitales ---------- */

const vitalsSchema = z.object({
  systolic_bp: z.coerce.number().int().min(70, "70–250 mmHg").max(250),
  diastolic_bp: z.coerce.number().int().min(40, "40–150 mmHg").max(150),
  heart_rate: z.coerce.number().int().min(30, "30–200 lpm").max(200),
  temperature: z.coerce.number().min(33).max(43).optional(),
  oxygen_saturation: z.coerce.number().int().min(70).max(100).optional(),
  glucose: z.coerce.number().int().min(40).max(500).optional(),
  weight_kg: z.coerce.number().min(25).max(300).optional(),
});
type VitalsForm = z.infer<typeof vitalsSchema>;

function RecordVitalsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { recordVitalsMutation } = useHealthMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VitalsForm>({ resolver: zodResolver(vitalsSchema) });

  const submit = (values: VitalsForm) => {
    recordVitalsMutation.mutate(values, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar signos vitales"
      description="Los valores se añaden a tu historial y alimentan tu puntuación de salud."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit(submit)} loading={recordVitalsMutation.isPending}>
            Guardar medición
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Input label="Tensión sistólica (mmHg)" error={errors.systolic_bp?.message} {...register("systolic_bp")} />
        <Input label="Tensión diastólica (mmHg)" error={errors.diastolic_bp?.message} {...register("diastolic_bp")} />
        <Input label="Frecuencia cardíaca (lpm)" error={errors.heart_rate?.message} {...register("heart_rate")} />
        <Input label="Temperatura (°C)" placeholder="36.5" error={errors.temperature?.message} {...register("temperature")} />
        <Input label="Saturación O₂ (%)" placeholder="97" error={errors.oxygen_saturation?.message} {...register("oxygen_saturation")} />
        <Input label="Glucosa (mg/dL)" placeholder="90" error={errors.glucose?.message} {...register("glucose")} />
        <Input label="Peso (kg)" placeholder="64.0" error={errors.weight_kg?.message} {...register("weight_kg")} />
      </form>
    </Modal>
  );
}

/* ---------- tabs ---------- */

function VitalsTab() {
  const { data: vitals, isLoading } = useVitals(30);

  if (isLoading) return <SkeletonCard />;
  if (!vitals?.length) {
    return <p className="py-8 text-center text-sm text-secondary">Aún no hay mediciones registradas.</p>;
  }

  const chartData = [...vitals]
    .reverse()
    .map((v) => ({
      date: format(new Date(v.recorded_at), "d MMM", { locale: es }),
      sistólica: v.systolic_bp,
      diastólica: v.diastolic_bp,
      fc: v.heart_rate,
    }));

  const last = vitals[vitals.length - 1]!;
  const prev = vitals[vitals.length - 2];
  const trend = (value: number, previous?: number) => {
    if (!previous) return null;
    const diff = value - previous;
    return diff === 0 ? "—" : diff > 0 ? `▲ ${diff}` : `▼ ${Math.abs(diff)}`;
  };

  const stats = [
    { label: "Tensión arterial", value: `${last.systolic_bp}/${last.diastolic_bp} mmHg`, trend: trend(last.systolic_bp, prev?.systolic_bp) },
    { label: "Frecuencia cardíaca", value: `${last.heart_rate} lpm`, trend: trend(last.heart_rate, prev?.heart_rate) },
    { label: "SpO₂", value: `${last.oxygen_saturation}%`, trend: trend(last.oxygen_saturation, prev?.oxygen_saturation) },
    { label: "Glucosa", value: `${last.glucose} mg/dL`, trend: trend(last.glucose, prev?.glucose) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-4">
            <p className="text-xs uppercase tracking-wide text-secondary">{s.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{s.value}</p>
            {s.trend && <p className="text-xs text-secondary">vs. anterior: {s.trend}</p>}
          </div>
        ))}
      </div>
      <div className="card-surface p-5">
        <h3 className="text-sm font-semibold">Evolución de presión arterial y FC (30 días)</h3>
        <div className="mt-4 h-64" role="img" aria-label="Gráfico de evolución de tensión arterial y frecuencia cardíaca">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" className="text-neutral-300 dark:text-neutral-700" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} width={44} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13 }} />
              <Line type="monotone" dataKey="sistólica" stroke="#dc2626" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="diastólica" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fc" stroke="#4A6fa5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SleepTab() {
  const { data: sleep, isLoading } = useSleep(14);

  if (isLoading) return <SkeletonCard />;
  if (!sleep?.length) {
    return <p className="py-8 text-center text-sm text-secondary">Sin registros de sueño todavía.</p>;
  }

  const chartData = [...sleep]
    .reverse()
    .map((s) => ({
      date: format(new Date(s.date), "d MMM", { locale: es }),
      Profundo: s.deep_sleep_minutes,
      REM: s.rem_sleep_minutes,
      Ligero: s.light_sleep_minutes,
      Despierto: s.awake_minutes,
    }));
  const avgEfficiency = Math.round(sleep.reduce((a, s) => a + s.efficiency, 0) / sleep.length);
  const avgDuration = Math.round(sleep.reduce((a, s) => a + s.duration_minutes, 0) / sleep.length);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-surface flex items-center gap-5 p-5">
          <CircularProgress value={avgEfficiency} max={100} label={`${avgEfficiency}%`} sublabel="eficiencia" color="serene" />
          <div>
            <p className="text-sm font-semibold">Duración media</p>
            <p className="text-2xl font-bold text-serene-600 dark:text-serene-300">
              {formatMinutesAsHours(avgDuration)}
            </p>
            <p className="text-xs text-secondary">Recomendado: 7–9 h</p>
          </div>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm font-semibold">Distribución media de fases</p>
          <ul className="mt-3 space-y-2.5">
            {[
              { label: "Sueño profundo", color: "serene" as const, minutes: Math.round(sleep.reduce((a, s) => a + s.deep_sleep_minutes, 0) / sleep.length) },
              { label: "REM", color: "sage" as const, minutes: Math.round(sleep.reduce((a, s) => a + s.rem_sleep_minutes, 0) / sleep.length) },
              { label: "Sueño ligero", color: "serene" as const, minutes: Math.round(sleep.reduce((a, s) => a + s.light_sleep_minutes, 0) / sleep.length) },
            ].map((phase) => (
              <li key={phase.label}>
                <ProgressBar
                  value={phase.minutes}
                  max={avgDuration}
                  label={`${phase.label} — ${formatMinutesAsHours(phase.minutes)}`}
                  color={phase.label === "REM" ? "sage" : "serene"}
                  size="sm"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card-surface p-5">
        <h3 className="text-sm font-semibold">Sueño por fases (14 días)</h3>
        <div className="mt-4 h-64" role="img" aria-label="Gráfico de barras del sueño por fases">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" className="text-neutral-300 dark:text-neutral-700" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} width={44} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13 }} />
              <Bar dataKey="Profundo" stackId="s" fill="#2f466a" />
              <Bar dataKey="REM" stackId="s" fill="#4A6fa5" />
              <Bar dataKey="Ligero" stackId="s" fill="#87A878" />
              <Bar dataKey="Despierto" stackId="s" fill="#e5e7eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const MOODS = [
  { value: 1, emoji: "😞", label: "Muy mal" },
  { value: 2, emoji: "😕", label: "Mal" },
  { value: 3, emoji: "😐", label: "Normal" },
  { value: 4, emoji: "🙂", label: "Bien" },
  { value: 5, emoji: "😄", label: "Muy bien" },
];

function MoodTab() {
  const { data: mood, isLoading } = useMood(14);
  const { recordMoodMutation } = useHealthMutations();
  const [selected, setSelected] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  if (isLoading) return <SkeletonCard />;

  const chartData = (mood ?? []).map((m) => ({
    date: format(new Date(m.date), "d MMM", { locale: es }),
    ánimo: m.mood,
  }));
  const avg = mood?.length
    ? (mood.reduce((a, m) => a + m.mood, 0) / mood.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-5">
      <div className="card-surface p-5">
        <h3 className="text-sm font-semibold">¿Cómo te sientes hoy?</h3>
        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Registrar ánimo">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={selected === m.value}
              onClick={() => setSelected(m.value)}
              className={`flex min-h-11 flex-col items-center justify-center rounded-xl border-2 px-4 py-2 transition-all duration-200 ${
                selected === m.value
                  ? "border-sage-500 bg-sage-100 dark:bg-sage-700/30"
                  : "border-[color:var(--color-border)] hover:border-sage-300"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{m.emoji}</span>
              <span className="text-[10px] text-secondary">{m.label}</span>
            </button>
          ))}
        </div>
        <Textarea
          className="mt-4"
          label="Notas (opcional)"
          placeholder="¿Qué influyó en tu ánimo hoy?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
        <Button
          className="mt-4"
          disabled={selected === null}
          loading={recordMoodMutation.isPending}
          onClick={() =>
            selected !== null &&
            recordMoodMutation.mutate(
              { mood: selected, emoji: MOODS[selected - 1]?.emoji ?? "😐", notes },
              {
                onSuccess: () => {
                  setSelected(null);
                  setNotes("");
                },
              },
            )
          }
        >
          Registrar ánimo
        </Button>
      </div>
      <div className="card-surface p-5">
        <h3 className="text-sm font-semibold">Historial de ánimo — media {avg}/5</h3>
        <div className="mt-4 h-56" role="img" aria-label="Gráfico de ánimo de los últimos 14 días">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A6fa5" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#4A6fa5" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="text-neutral-300 dark:text-neutral-700" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "currentColor", fontSize: 11 }} className="text-secondary" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13 }} />
              <Area type="monotone" dataKey="ánimo" stroke="#4A6fa5" strokeWidth={2.5} fill="url(#moodGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ---------- página ---------- */

export default function HealthPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: score } = useHealthScore();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Salud</h1>
          <p className="text-sm text-secondary">
            Signos vitales, sueño y ánimo — el pulso de tu bienestar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {score && (
            <div className="hidden items-center gap-3 rounded-xl bg-[color:var(--color-surface)] px-4 py-2 shadow-soft sm:flex">
              <span className="text-2xl font-bold text-sage-600 dark:text-sage-300">{score.score}</span>
              <span className="text-xs text-secondary">Puntuación<br />de salud</span>
            </div>
          )}
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Registrar medición
          </Button>
        </div>
      </header>

      <Tabs
        items={[
          {
            id: "vitals",
            label: "Signos vitales",
            icon: <HeartPulse className="h-4 w-4" aria-hidden="true" />,
            content: <VitalsTab />,
          },
          {
            id: "sleep",
            label: "Sueño",
            icon: <Moon className="h-4 w-4" aria-hidden="true" />,
            content: <SleepTab />,
          },
          {
            id: "mood",
            label: "Ánimo",
            icon: <Smile className="h-4 w-4" aria-hidden="true" />,
            content: <MoodTab />,
          },
        ]}
      />

      <RecordVitalsModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
