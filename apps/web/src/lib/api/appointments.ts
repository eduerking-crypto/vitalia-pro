import type {
  Appointment,
  AppointmentInput,
  Specialty,
} from "@vitalia/shared-types";
import { api } from "./client";

export async function fetchAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>("/appointments");
  return data;
}

export async function createAppointment(input: AppointmentInput): Promise<Appointment> {
  const { data } = await api.post<Appointment>("/appointments", input);
  return data;
}

export async function updateAppointment(
  id: string,
  input: Partial<AppointmentInput & { status: Appointment["status"] }>,
): Promise<Appointment> {
  const { data } = await api.put<Appointment>(`/appointments/${id}`, input);
  return data;
}

export async function cancelAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`);
}

export async function fetchSpecialties(): Promise<Specialty[]> {
  const { data } = await api.get<Specialty[]>("/appointments/specialties");
  return data;
}
