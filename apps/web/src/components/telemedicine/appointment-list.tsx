"use client";

import { useState } from "react";
import { Video, Clock, CalendarCheck, Trash2 } from "lucide-react";
import { useAppointmentMutations, useAppointments } from "@/hooks/use-appointments";
import { toast } from "@/stores/use-notification-store";
import { Modal } from "@/components/ui";
import { Button, Badge, EmptyState } from "@/components/ui";
import { formatDate, formatTimeHM } from "@/lib/utils";
import { MODALITY_LABELS, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import type { Appointment } from "@/types/appointment";

interface AppointmentListProps {
  onEdit: (id: string) => void;
}

export function AppointmentList({ onEdit }: AppointmentListProps) {
  const { cancel } = useAppointmentMutations();
  const { data: appointments, isLoading } = useAppointments();
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");

  if (isLoading) return <SkeletonCard />;

  const upcoming = (appointments ?? []).filter(
    (a) => a.status === "pending" || a.status === "confirmed",
  );
  const history = (appointments ?? []).filter(
    (a) => a.status === "cancelled" || a.status === "completed",
  );

  return (
    <section className="space-y-4">
      <div className="flex gap-1 rounded-xl border border-[color:var(--color-border)] bg-sage-50 p-1 dark:bg-neutral-900">
        <TabButton
          active={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
          label="Próximas citas"
          count={upcoming.length}
        />
        <TabButton
          active={tab === "history"}
          onClick={() => setTab("history")}
          label="Historial"
          count={history.length}
        />
      </div>

      {tab === "upcoming" ? (
        <UpcomingList items={upcoming} onCancel={(id) => cancel.mutate(id)} onEdit={onEdit} />
      ) : (
        <HistoryList items={history} onEdit={onEdit} />
      )}
    </section>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-w-max items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-[color:var(--color-surface)] text-ink shadow-soft dark:text-neutral-100"
          : "text-secondary hover:text-ink dark:hover:text-neutral-200"
      }`}
    >
      {label} <span className="text-[10px] opacity-60">({count})</span>
    </button>
  );
}

function UpcomingList({
  items,
  onCancel,
  onEdit,
}: {
  items: Appointment[];
  onCancel: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Sin citas próximas"
        description="Pide una cita con el especialista que necesitas."
        action={<Button size="sm" onClick={() => {}}>Pedir cita</Button>}
      />
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <AppointmentCard key={a.id} appointment={a} onCancel={() => onCancel(a.id)} onEdit={() => onEdit(a.id)} />
      ))}
    </ul>
  );
}

function HistoryList({ items, onEdit }: { items: Appointment[]; onEdit: (id: string) => void }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-secondary">Sin citas en el historial.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <AppointmentCard key={a.id} appointment={a} onCancel={() => {}} onEdit={() => onEdit(a.id)} showStatus />
      ))}
    </ul>
  );
}

function AppointmentCard({
  appointment,
  onCancel,
  onEdit,
  showStatus = false,
}: {
  appointment: Appointment;
  onCancel: () => void;
  onEdit: () => void;
  showStatus?: boolean;
}) {
  const isVideo = appointment.modality === "video";
  return (
    <div className="card-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold">{appointment.doctor_name}</p>
        <p className="text-sm text-secondary">
          {appointment.specialty} · {formatDate(appointment.date)} a las {formatTimeHM(appointment.time)}
        </p>
        <p className="text-xs text-secondary">
          {MODALITY_LABELS[appointment.modality]} {isVideo ? "· Sala de video" : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {showStatus && (
          <Badge variant={appointment.status === "completed" ? "success" : "danger"} dot>
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </Badge>
        )}
        {appointment.status === "pending" && (
          <>
            <Button size="sm" variant="outline" onClick={() => onEdit()} disabled>
              Confirmar
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit()} disabled>
              Reprogramar
            </Button>
          </>
        )}
        {appointment.status === "confirmed" && (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                toast.info("La sala de video se abre 10 minutos antes de la cita.");
              }}
              disabled
            >
              <Video className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Unirse a videoconsulta
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCancel()} disabled>
              Cancelar
            </Button>
          </>
        )}
        {appointment.status === "cancelled" && (
          <Button size="sm" variant="outline" onClick={() => onEdit()} disabled>
            Reagendar
          </Button>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card-surface p-4 flex items-center gap-4" aria-hidden="true">
      <div className="h-10 w-10 rounded-lg bg-sage-100/80 dark:bg-neutral-800" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-sage-100/80 dark:bg-neutral-800" />
        <div className="h-3 w-1/2 bg-sage-100/80 dark:bg-neutral-800" />
      </div>
    </div>
  );
}
