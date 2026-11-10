"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FlaskConical, Plus, Upload } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { fetchLab, fetchLabs, uploadLab } from "@/lib/api/labs";
import { toast } from "@/stores/use-notification-store";
import { apiErrorMessage, formatDate } from "@/lib/utils";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  SkeletonCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import type { LabMetric, LabResult } from "@/types/health";

const statusVariant = { normal: "success", review: "warning", critical: "danger" } as const;
const statusLabel = { normal: "Normal", review: "A revisar", critical: "Crítico" } as const;

const labSchema = z.object({
  test_name: z.string().min(3, "Indica el nombre del análisis"),
  lab_name: z.string().min(3, "Indica el laboratorio"),
  date: z.string().min(1, "Indica la fecha"),
});
type LabForm = z.infer<typeof labSchema>;

/** Barra de rango de referencia con marcador del valor del paciente. */
function MetricRangeBar({ metric }: { metric: LabMetric }) {
  const span = Math.max(metric.reference_max - metric.reference_min, 1);
  const pct = Math.min(100, Math.max(0, ((metric.value - metric.reference_min) / span) * 100));
  const outOfRange = metric.value < metric.reference_min || metric.value > metric.reference_max;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{metric.name}</span>
        <span className="tabular-nums">
          <span className={outOfRange ? "font-bold text-danger" : "font-semibold"}>
            {metric.value} {metric.unit}
          </span>
          <span className="ml-2 text-xs text-secondary">
            ref. {metric.reference_min}–{metric.reference_max}
          </span>
        </span>
      </div>
      <div
        className="relative mt-1.5 h-2 rounded-full bg-sage-100 dark:bg-neutral-800"
        role="img"
        aria-label={`${metric.name}: ${metric.value} ${metric.unit}, referencia ${metric.reference_min} a ${metric.reference_max} ${metric.unit}`}
      >
        <span
          className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white dark:ring-neutral-900 ${outOfRange ? "bg-danger" : "bg-success"}`}
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LabDetailModal({ lab, onClose }: { lab: LabResult | null; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.lab(lab?.id ?? ""),
    queryFn: () => fetchLab(lab!.id),
    enabled: Boolean(lab),
  });

  const result = data ?? lab;

  return (
    <Modal open={Boolean(lab)} onClose={onClose} title={result?.test_name ?? "Resultado"} size="lg"
      description={result ? `${result.lab_name} · ${formatDate(result.date)}` : undefined}
    >
      {isLoading && <p className="text-sm text-secondary">Cargando detalles…</p>}
      {result && (
        <div className="space-y-4">
          <Badge variant={statusVariant[result.status]} dot>
            {statusLabel[result.status]}
          </Badge>
          <div className="space-y-4">
            {result.values.map((metric) => (
              <MetricRangeBar key={metric.name} metric={metric} />
            ))}
          </div>
          {result.status === "review" && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-700/20 dark:text-amber-300">
              Hay valores fuera de rango. Comparte este resultado con tu profesional sanitario
              para una interpretación adecuada.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

function UploadLabModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LabForm>({
    resolver: zodResolver(labSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  });

  const submit = async (values: LabForm) => {
    try {
      await uploadLab({ ...values, values: [] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.labs });
      toast.success("Resultado registrado", values.test_name);
      reset();
      onClose();
    } catch (error) {
      toast.error("No se pudo registrar", apiErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar resultado de laboratorio"
      description="Los valores detallados podrán importarse desde el archivo original en próximas versiones."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit(submit)} type="submit">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Registrar
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input label="Nombre del análisis" placeholder="Perfil lipídico" error={errors.test_name?.message} {...register("test_name")} />
        <Input label="Laboratorio" placeholder="Laboratorio Central Vitalia" error={errors.lab_name?.message} {...register("lab_name")} />
        <Input label="Fecha del análisis" type="date" error={errors.date?.message} {...register("date")} />
      </form>
    </Modal>
  );
}

export default function LabsPage() {
  const [selected, setSelected] = useState<LabResult | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: labs, isLoading } = useQuery({
    queryKey: QUERY_KEYS.labs,
    queryFn: fetchLabs,
  });

  const sorted = useMemo(
    () => [...(labs ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    [labs],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Laboratorios</h1>
          <p className="text-sm text-secondary">
            Tus analíticas con visualización frente a rangos de referencia.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Registrar resultado
        </Button>
      </header>

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!isLoading && sorted.length === 0 && (
        <EmptyState
          icon={FlaskConical}
          title="Sin resultados de laboratorio"
          description="Cuando tu centro médico comparta analíticas, aparecerán aquí con su interpretación visual."
          action={<Button onClick={() => setUploadOpen(true)}>Registrar el primero</Button>}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {sorted.map((lab) => (
          <button
            key={lab.id}
            type="button"
            onClick={() => setSelected(lab)}
            className="card-surface w-full p-5 text-left transition-shadow duration-200 hover:shadow-elevated"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{lab.test_name}</h2>
                <p className="text-sm text-secondary">
                  {lab.lab_name} · {formatDate(lab.date)}
                </p>
              </div>
              <Badge variant={statusVariant[lab.status]} dot>
                {statusLabel[lab.status]}
              </Badge>
            </div>
            <Table className="mt-3">
              <TableHeader>
                <TableRow>
                  <TableHead>Parámetro</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Referencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lab.values.slice(0, 3).map((metric) => (
                  <TableRow key={metric.name}>
                    <TableCell className="font-medium">{metric.name}</TableCell>
                    <TableCell className="tabular-nums">{metric.value} {metric.unit}</TableCell>
                    <TableCell className="tabular-nums text-secondary">
                      {metric.reference_min}–{metric.reference_max}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {lab.values.length > 3 && (
              <p className="mt-2 text-xs text-secondary">
                +{lab.values.length - 3} parámetros más — pulsa para ver el detalle
              </p>
            )}
          </button>
        ))}
      </div>

      <LabDetailModal lab={selected} onClose={() => setSelected(null)} />
      <UploadLabModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
