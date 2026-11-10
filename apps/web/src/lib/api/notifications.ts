import type { Notification } from "@vitalia/shared-types";
import { api } from "./client";

export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>("/notifications");
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}
