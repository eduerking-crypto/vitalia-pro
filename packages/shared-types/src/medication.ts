import type { UUID } from "./index";

export type MedicationFrequency = "once_daily" | "twice_daily" | "three_times_daily" | "every_8h" | "every_12h" | "as_needed" | "weekly";

export interface Medication {
  id: UUID;
  user_id: UUID;
  name: string;
  active_ingredient: string;
  dosage: string;
  frequency: MedicationFrequency;
  time: string; // HH:MM
  instructions: string;
  start_date: string; // ISO date
  end_date: string | null; // ISO date
  is_active: boolean;
  reminder_enabled: boolean;
  remaining_quantity: number;
  rxnorm_code: string;
  prescribed_by: string;
}

export interface MedicationInput {
  name: string;
  active_ingredient: string;
  dosage: string;
  frequency: MedicationFrequency;
  time: string;
  instructions?: string;
  start_date: string;
  end_date?: string | null;
  reminder_enabled?: boolean;
  remaining_quantity?: number;
  prescribed_by?: string;
}

export type MedicationLogStatus = "taken" | "skipped" | "late";

export interface MedicationLog {
  id: UUID;
  medication_id: UUID;
  taken_at: string; // ISO datetime
  status: MedicationLogStatus;
}

export interface DrugInteraction {
  medication_a: string;
  medication_b: string;
  severity: "minor" | "moderate" | "major" | "contraindicated";
  description: string;
  recommendation: string;
}

export interface InteractionCheckResponse {
  interactions: DrugInteraction[];
  checked_at: string; // ISO datetime
}

export interface AdherenceStats {
  period_days: number;
  expected_doses: number;
  taken_doses: number;
  skipped_doses: number;
  late_doses: number;
  adherence_rate: number; // 0–100
  by_medication: Array<{
    medication_id: UUID;
    name: string;
    adherence_rate: number;
  }>;
}
