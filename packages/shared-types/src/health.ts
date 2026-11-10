import type { UUID } from "./index";

export interface VitalSign {
  id: UUID;
  user_id: UUID;
  recorded_at: string; // ISO datetime
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  temperature: number;
  oxygen_saturation: number;
  glucose: number;
  weight_kg: number;
}

export interface VitalSignInput {
  recorded_at?: string;
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  temperature?: number;
  oxygen_saturation?: number;
  glucose?: number;
  weight_kg?: number;
}

export interface SleepRecord {
  id: UUID;
  user_id: UUID;
  date: string; // ISO date
  duration_minutes: number;
  deep_sleep_minutes: number;
  rem_sleep_minutes: number;
  light_sleep_minutes: number;
  awake_minutes: number;
  efficiency: number; // 0–100
  notes: string;
}

export interface MoodRecord {
  id: UUID;
  user_id: UUID;
  date: string; // ISO date
  mood: number; // 1–5
  emoji: string;
  notes: string;
}

export interface HealthScore {
  score: number; // 0–100
  label: "excelente" | "buena" | "regular" | "requiere atención";
  components: Array<{
    key: string;
    name: string;
    value: number; // 0–100
    weight: number;
  }>;
  computed_at: string;
}
