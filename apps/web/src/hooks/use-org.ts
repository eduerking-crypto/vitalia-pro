"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchOrg,
  fetchOrgAppointments,
  fetchOrgAudit,
  fetchOrgPatients,
  fetchOrgReport,
  fetchOrgSummary,
  fetchOrgTeam,
} from "@/lib/api/org";

export function useOrg(enabled = true) {
  return useQuery({ queryKey: ["org"], queryFn: fetchOrg, staleTime: 60_000, enabled });
}

export function useOrgSummary() {
  return useQuery({ queryKey: ["org", "summary"], queryFn: fetchOrgSummary, staleTime: 30_000 });
}

export function useOrgPatients(params?: { risk?: string; search?: string }) {
  return useQuery({
    queryKey: ["org", "patients", params ?? {}],
    queryFn: () => fetchOrgPatients(params),
    staleTime: 30_000,
  });
}

export function useOrgAppointments(days = 14) {
  return useQuery({
    queryKey: ["org", "appointments", days],
    queryFn: () => fetchOrgAppointments(days),
    staleTime: 30_000,
  });
}

export function useOrgTeam() {
  return useQuery({ queryKey: ["org", "team"], queryFn: fetchOrgTeam, staleTime: 60_000 });
}

export function useOrgAudit() {
  return useQuery({ queryKey: ["org", "audit"], queryFn: fetchOrgAudit, staleTime: 30_000 });
}

export function useOrgReport() {
  return useQuery({ queryKey: ["org", "report"], queryFn: fetchOrgReport, staleTime: 60_000 });
}
