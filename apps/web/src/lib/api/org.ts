import { api } from "./client";
import {
  MOCK_APPOINTMENTS,
  MOCK_AUDIT,
  MOCK_ORG,
  MOCK_PATIENTS,
  MOCK_REPORT,
  MOCK_SUMMARY,
  MOCK_TEAM,
} from "./mock/org";

/** Portal de empresa (IPS/clínica): cliente de API con respaldo local. */

export interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
  seats: number;
  city: string | null;
  country: string | null;
  sector: string | null;
  primary_color: string;
  tax_id: string | null;
  is_active: boolean;
}

export interface OrgKpiPoint {
  label: string;
  value: number;
}

export interface OrgSummary {
  organization: Org;
  patients_total: number;
  professionals_total: number;
  appointments_week: number;
  adherence_rate: number;
  high_risk: number;
  alerts: number;
  active_patients_7d: number;
  risk_distribution: OrgKpiPoint[];
  adherence_series: OrgKpiPoint[];
  consultations_series: OrgKpiPoint[];
}

export interface OrgPatient {
  id: string;
  full_name: string;
  email: string;
  risk_level: "low" | "medium" | "high" | string;
  cohort: string | null;
  professional_name: string | null;
  last_vital_at: string | null;
  last_systolic: number | null;
  last_diastolic: number | null;
  last_heart_rate: number | null;
  adherence_rate: number;
  medications_active: number;
  next_appointment: string | null;
}

export interface OrgAppointment {
  id: string;
  patient_name: string;
  professional_name: string | null;
  specialty: string;
  date: string;
  time: string;
  modality: string;
  status: string;
}

export interface OrgMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  specialty: string | null;
  license_number: string | null;
  phone: string | null;
  is_active: boolean;
  patients_count: number;
  appointments_week: number;
}

export interface OrgAudit {
  id: number;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  actor_name: string | null;
}

export interface OrgReport {
  adherence_by_professional: OrgKpiPoint[];
  patients_by_cohort: OrgKpiPoint[];
  top_conditions: OrgKpiPoint[];
  avg_adherence: number;
  avg_systolic: number;
  avg_glucose: number;
}

async function withFallback<T>(request: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await request();
  } catch {
    return fallback;
  }
}

export const fetchOrg = () => withFallback(async () => (await api.get<Org>("/org/me")).data, MOCK_ORG);

export const fetchOrgSummary = () =>
  withFallback(async () => (await api.get<OrgSummary>("/org/summary")).data, MOCK_SUMMARY);

export const fetchOrgPatients = (params?: { risk?: string; search?: string }) =>
  withFallback(
    async () => (await api.get<OrgPatient[]>("/org/patients", { params })).data,
    MOCK_PATIENTS,
  );

export const fetchOrgAppointments = (days = 14) =>
  withFallback(
    async () => (await api.get<OrgAppointment[]>("/org/appointments", { params: { days } })).data,
    MOCK_APPOINTMENTS,
  );

export const fetchOrgTeam = () =>
  withFallback(async () => (await api.get<OrgMember[]>("/org/professionals")).data, MOCK_TEAM);

export const fetchOrgAudit = () =>
  withFallback(async () => (await api.get<OrgAudit[]>("/org/audit")).data, MOCK_AUDIT);

export const fetchOrgReport = () =>
  withFallback(async () => (await api.get<OrgReport>("/org/reports")).data, MOCK_REPORT);
