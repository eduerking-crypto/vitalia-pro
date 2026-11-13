"use client";

import { useMemo, useState } from "react";
import { Search, TriangleAlert, UserRound } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  ProgressBar,
  Select,
  SkeletonCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useOrgPatients } from "@/hooks/use-org";
import { formatDateTime } from "@/lib/utils";

const RISK = {
  high: { label: "Alto", variant: "danger" as const },
  medium: { label: "Medio", variant: "warning" as const },
  low: { label: "Bajo", variant: "success" as const },
};

export default function OrgPatientsPage() {
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const { data, isLoading } = useOrgPatients({ risk: risk || undefined });

  const patients = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) => p.full_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Pacientes</h1>
        <p className="mt-1 text-sm text-secondary">
          Seguimiento clínico con riesgo, adherencia y últimos signos vitales.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          <Input
            placeholder="Buscar por nombre o correo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Buscar pacientes"
          />
        </div>
        <Select
          aria-label="Filtrar por riesgo"
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          className="sm:w-48"
        >
          <option value="">Todos los riesgos</option>
          <option value="high">Riesgo alto</option>
          <option value="medium">Riesgo medio</option>
          <option value="low">Riesgo bajo</option>
        </Select>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Listado ({patients.length})</CardTitle>
            <Badge variant="neutral">Ordenado por riesgo</Badge>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Riesgo</TableHead>
                  <TableHead>Cohorte</TableHead>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Adherencia</TableHead>
                  <TableHead>Última TA</TableHead>
                  <TableHead>Próxima cita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => {
                  const risk = RISK[p.risk_level as keyof typeof RISK] ?? RISK.low;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-serene-100 text-serene-700 dark:bg-serene-700/30 dark:text-serene-200">
                            <UserRound className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="leading-tight">
                            <p className="font-medium">{p.full_name}</p>
                            <p className="text-xs text-secondary">{p.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={risk.variant} dot>
                          {risk.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-secondary">{p.cohort ?? "—"}</TableCell>
                      <TableCell className="text-secondary">{p.professional_name ?? "Sin asignar"}</TableCell>
                      <TableCell>
                        <div className="min-w-28">
                          <ProgressBar
                            value={p.adherence_rate}
                            color={p.adherence_rate < 60 ? "danger" : p.adherence_rate < 80 ? "warning" : "sage"}
                            size="sm"
                          />
                          <p className="mt-1 text-xs text-secondary">{p.adherence_rate}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.last_systolic && p.last_diastolic ? (
                          <span className="inline-flex items-center gap-1.5">
                            {p.last_systolic}/{p.last_diastolic}
                            <span className="text-xs text-secondary">mmHg</span>
                            {p.last_systolic >= 140 && (
                              <TriangleAlert className="h-3.5 w-3.5 text-danger" aria-label="Tensión elevada" />
                            )}
                          </span>
                        ) : (
                          <span className="text-secondary">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {p.next_appointment
                          ? formatDateTime(p.next_appointment)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {patients.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-secondary">
                No hay pacientes que coincidan con el filtro.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
