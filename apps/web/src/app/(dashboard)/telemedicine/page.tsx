"use client";

import { useState } from "react";
import { CalendarCheck, Stethoscope, Plus } from "lucide-react";
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentList } from "@/components/telemedicine/appointment-list";
import { SpecialtyGrid } from "@/components/telemedicine/specialty-grid";
import { AppointmentForm } from "@/components/telemedicine/appointment-form";
import { Modal } from "@/components/ui";
import { Tabs } from "@/components/ui/tabs";
import { SkeletonCard } from "@/components/ui";
import { Button } from "@/components/ui/button";

export default function TelemedicinePage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string } | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Telemedicina</h1>
          <p className="text-sm text-secondary">
            Especialistas, citas y videoconsulta desde cualquier lugar.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Pedir cita
        </Button>
      </header>

      <Tabs
        items={[
          {
            id: "specialties",
            label: "Especialidades",
            icon: <Stethoscope className="h-4 w-4" aria-hidden="true" />,
            content: <SpecialtyGrid onRequest={() => setOpen(true)} />,
          },
          {
            id: "appointments",
            label: "Mis citas",
            icon: <CalendarCheck className="h-4 w-4" aria-hidden="true" />,
            content: <AppointmentList onEdit={(id) => setEditing({ id })} />,
          },
        ]}
        defaultTabId="specialties"
      />

      <AppointmentForm
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
