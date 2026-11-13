"use client";

import { CalendarDays, Clock, Video, MapPin } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, SkeletonCard } from "@/components/ui";
import { useOrgAppointments } from "@/hooks/use-org";
import { formatDate, formatTimeHM } from "@/lib/utils";

const STATUS: Record<string, { label: string; variant: "success" | "warning" | "neutral" | "danger" }> = {
  confirmed: { label: "Confirmada", variant: "success" },
  pending: { label: "Pendiente", variant: "warning" },
  completed: { label: "Completada", variant: "neutral" },
  cancelled: { label: "Cancelada", variant: "danger" },
};

export default function OrgAgendaPage() {
  const { data, isLoading } = useOrgAppointments(14);

  const groups = (data ?? []).reduce<Record<string, typeof data>>((acc, appt) => {
    const key = appt.date;
    (acc[key] ??= [] as never).push(appt);
    return acc;
  }, {});

  const dates = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Agenda</h1>
        <p className="mt-1 text-sm text-secondary">
          Citas de los próximos 14 días de todos los pacientes de la organización.
        </p>
      </header>

      {isLoading ? (
        <SkeletonCard />
      ) : dates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-neutral-300" aria-hidden="true" />
            <p className="mt-3 text-sm text-secondary">No hay citas en el periodo seleccionado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {dates.map((date) => (
            <Card key={date}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="capitalize">{formatDate(date, "EEEE d 'de' MMMM")}</CardTitle>
                <Badge variant="serene">{groups[date]?.length ?? 0} citas</Badge>
              </CardHeader>
              <CardContent className="divide-y divide-[color:var(--color-border)] pt-0">
                {(groups[date] ?? []).map((appt) => {
                  const status =
                    STATUS[appt.status] ?? { label: "Pendiente", variant: "warning" as const };
                  return (
                    <div
                      key={appt.id}
                      className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-700 dark:bg-sage-700/30 dark:text-sage-200">
                          <Clock className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="leading-tight">
                          <p className="font-semibold">{appt.patient_name}</p>
                          <p className="text-xs text-secondary">
                            {appt.specialty} · {appt.professional_name ?? "Sin asignar"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium tabular-nums">{formatTimeHM(appt.time)}</span>
                        <Badge variant={appt.modality === "video" ? "serene" : "neutral"}>
                          {appt.modality === "video" ? (
                            <Video className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <MapPin className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {appt.modality === "video" ? "Videoconsulta" : "Presencial"}
                        </Badge>
                        <Badge variant={status.variant} dot>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
