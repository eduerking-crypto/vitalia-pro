import type { UUID } from "./index";

export type LabStatus = "normal" | "review" | "critical";

export interface LabMetric {
  name: string;
  value: number;
  unit: string;
  reference_min: number;
  reference_max: number;
  status: LabStatus;
}

export interface LabResult {
  id: UUID;
  user_id: UUID;
  test_name: string;
  lab_name: string;
  date: string; // ISO date
  status: LabStatus;
  file_url: string;
  values: LabMetric[];
}

export interface LabResultInput {
  test_name: string;
  lab_name: string;
  date: string;
  values: Array<{
    name: string;
    value: number;
    unit: string;
    reference_min: number;
    reference_max: number;
  }>;
}
