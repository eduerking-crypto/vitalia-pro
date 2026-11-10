"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VitalSignInput } from "@vitalia/shared-types";
import { QUERY_KEYS } from "@/lib/constants";
import {
  fetchHealthScore,
  fetchMood,
  fetchSleep,
  fetchVitals,
  recordMood,
  recordVitals,
} from "@/lib/api/health";
import { toast } from "@/stores/use-notification-store";
import { apiErrorMessage } from "@/lib/utils";

export function useVitals(days = 30) {
  return useQuery({
    queryKey: QUERY_KEYS.vitals(days),
    queryFn: () => fetchVitals(days),
  });
}

export function useSleep(days = 14) {
  return useQuery({
    queryKey: QUERY_KEYS.sleep(days),
    queryFn: () => fetchSleep(days),
  });
}

export function useMood(days = 14) {
  return useQuery({
    queryKey: QUERY_KEYS.mood(days),
    queryFn: () => fetchMood(days),
  });
}

export function useHealthScore() {
  return useQuery({
    queryKey: QUERY_KEYS.healthScore,
    queryFn: fetchHealthScore,
  });
}

export function useHealthMutations() {
  const queryClient = useQueryClient();

  const recordVitalsMutation = useMutation({
    mutationFn: (input: VitalSignInput) => recordVitals(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health"] });
      toast.success("Signos vitales registrados");
    },
    onError: (error) => toast.error("No se pudieron registrar", apiErrorMessage(error)),
  });

  const recordMoodMutation = useMutation({
    mutationFn: (input: { mood: number; emoji: string; notes?: string }) =>
      recordMood(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health"] });
      toast.success("Ánimo registrado");
    },
    onError: (error) => toast.error("No se pudo registrar el ánimo", apiErrorMessage(error)),
  });

  return { recordVitalsMutation, recordMoodMutation };
}
