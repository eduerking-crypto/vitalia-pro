export type {
  Medication,
  MedicationInput,
  MedicationFrequency,
  MedicationLog,
  MedicationLogStatus,
  DrugInteraction,
  InteractionCheckResponse,
  AdherenceStats,
} from "@vitalia/shared-types";

import type { Medication } from "@vitalia/shared-types";

/** Vista de medicamento con el estado de toma del día (local + API). */
export type MedicationView = Medication & {
  taken_today?: boolean;
  skipped_today?: boolean;
};
