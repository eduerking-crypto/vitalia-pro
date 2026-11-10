import type { UUID } from "./index";

export type NotificationType = "medication" | "appointment" | "achievement" | "alert";

export interface Notification {
  id: UUID;
  user_id: UUID;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string; // ISO datetime
}
