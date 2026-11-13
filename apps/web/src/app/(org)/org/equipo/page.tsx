"use client";

import { CalendarCheck, Stethoscope, Users } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, SkeletonCard } from "@/components/ui";
import { useOrgTeam } from "@/hooks/use-org";

export default function OrgTeamPage() {
  const { data, isLoading } = useOrgTeam();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Equipo</h1>
        <p className="mt-1 text-sm text-secondary">
          Profesionales y administradores con su carga asistencial.
        </p>
      </header>

      {isLoading ? (
        <SkeletonCard />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((member) => (
            <Card key={member.id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">{member.full_name}</CardTitle>
                  <p className="text-xs text-secondary">{member.email}</p>
                </div>
                <Badge variant={member.role === "admin" ? "serene" : "sage"} dot>
                  {member.role === "admin" ? "Administración" : "Profesional"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Stethoscope className="h-4 w-4" aria-hidden="true" />
                  {member.specialty ?? "Sin especialidad"}
                  {member.license_number && (
                    <span className="text-xs">· Lic. {member.license_number}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900/60">
                    <p className="text-lg font-bold tabular-nums">{member.patients_count}</p>
                    <p className="flex items-center justify-center gap-1 text-xs text-secondary">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      Pacientes
                    </p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900/60">
                    <p className="text-lg font-bold tabular-nums">{member.appointments_week}</p>
                    <p className="flex items-center justify-center gap-1 text-xs text-secondary">
                      <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Citas / semana
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
