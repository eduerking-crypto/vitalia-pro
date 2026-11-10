import type {
  HealthScore,
  MoodRecord,
  SleepRecord,
  VitalSign,
  VitalSignInput,
} from "@vitalia/shared-types";
import { api } from "./client";

export async function fetchVitals(days = 30): Promise<VitalSign[]> {
  const { data } = await api.get<VitalSign[]>("/health/vitals", { params: { days } });
  return data;
}

export async function recordVitals(input: VitalSignInput): Promise<VitalSign> {
  const { data } = await api.post<VitalSign>("/health/vitals", input);
  return data;
}

export async function fetchSleep(days = 14): Promise<SleepRecord[]> {
  const { data } = await api.get<SleepRecord[]>("/health/sleep", { params: { days } });
  return data;
}

export async function fetchMood(days = 14): Promise<MoodRecord[]> {
  const { data } = await api.get<MoodRecord[]>("/health/mood", { params: { days } });
  return data;
}

export async function recordMood(input: {
  mood: number;
  emoji: string;
  notes?: string;
}): Promise<MoodRecord> {
  const { data } = await api.post<MoodRecord>("/health/mood", input);
  return data;
}

export async function fetchHealthScore(): Promise<HealthScore> {
  const { data } = await api.get<HealthScore>("/health/score");
  return data;
}
