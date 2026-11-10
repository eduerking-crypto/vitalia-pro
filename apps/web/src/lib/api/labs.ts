import type { LabResult, LabResultInput } from "@vitalia/shared-types";
import { api } from "./client";

export async function fetchLabs(): Promise<LabResult[]> {
  const { data } = await api.get<LabResult[]>("/labs");
  return data;
}

export async function fetchLab(id: string): Promise<LabResult> {
  const { data } = await api.get<LabResult>(`/labs/${id}`);
  return data;
}

export async function uploadLab(input: LabResultInput): Promise<LabResult> {
  const { data } = await api.post<LabResult>("/labs", input);
  return data;
}
