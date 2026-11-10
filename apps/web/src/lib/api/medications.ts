import type {
  AdherenceStats,
  InteractionCheckResponse,
  Medication,
  MedicationInput,
} from "@vitalia/shared-types";
import { api } from "./client";

export async function fetchMedications(): Promise<Medication[]> {
  const { data } = await api.get<Medication[]>("/medications");
  return data;
}

export async function createMedication(input: MedicationInput): Promise<Medication> {
  const { data } = await api.post<Medication>("/medications", input);
  return data;
}

export async function updateMedication(
  id: string,
  input: Partial<MedicationInput>,
): Promise<Medication> {
  const { data } = await api.put<Medication>(`/medications/${id}`, input);
  return data;
}

export async function deleteMedication(id: string): Promise<void> {
  await api.delete(`/medications/${id}`);
}

export async function markMedicationTaken(
  id: string,
  status: "taken" | "skipped" | "late" = "taken",
): Promise<void> {
  await api.patch(`/medications/${id}/taken`, { status });
}

export async function fetchInteractions(): Promise<InteractionCheckResponse> {
  const { data } = await api.get<InteractionCheckResponse>("/medications/interactions");
  return data;
}

export async function fetchAdherence(days = 30): Promise<AdherenceStats> {
  const { data } = await api.get<AdherenceStats>("/medications/adherence", {
    params: { days },
  });
  return data;
}
