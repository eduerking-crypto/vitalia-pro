import type { UUID } from "./index";

export type AppointmentModality = "video" | "in_person";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Appointment {
  id: UUID;
  user_id: UUID;
  doctor_name: string;
  specialty: string;
  date: string; // ISO date
  time: string; // HH:MM
  modality: AppointmentModality;
  status: AppointmentStatus;
  reason: string;
  notes: string;
}

export interface AppointmentInput {
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  modality: AppointmentModality;
  reason?: string;
  notes?: string;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
  next_available: string; // ISO date
  doctors_available: number;
}
