import type { Allergy, MedicalProfile, User } from "@vitalia/shared-types";
import { api } from "./client";

export async function fetchProfile(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export async function updateProfile(input: Partial<User>): Promise<User> {
  const { data } = await api.put<User>("/users/me", input);
  return data;
}

export async function fetchMedicalProfile(): Promise<MedicalProfile> {
  const { data } = await api.get<MedicalProfile>("/users/me/medical");
  return data;
}

export async function updateMedicalProfile(
  input: Partial<MedicalProfile>,
): Promise<MedicalProfile> {
  const { data } = await api.put<MedicalProfile>("/users/me/medical", input);
  return data;
}

export async function addAllergy(input: {
  allergen: string;
  severity: Allergy["severity"];
  reaction: string;
}): Promise<Allergy> {
  const { data } = await api.post<Allergy>("/users/me/allergies", input);
  return data;
}

export async function removeAllergy(id: string): Promise<void> {
  await api.delete(`/users/me/allergies/${id}`);
}
