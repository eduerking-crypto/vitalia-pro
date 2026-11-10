"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: fetchNotifications,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(id).then(() => id),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: invalidate,
  });

  return { markRead, markAllRead };
}
