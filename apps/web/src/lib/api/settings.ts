import type { UserSettings } from "@vitalia/shared-types";
import { api } from "./client";

export async function fetchSettings(): Promise<UserSettings> {
  const { data } = await api.get<UserSettings>("/settings");
  return data;
}

export async function updateSettings(input: Partial<UserSettings>): Promise<UserSettings> {
  const { data } = await api.put<UserSettings>("/settings", input);
  return data;
}
