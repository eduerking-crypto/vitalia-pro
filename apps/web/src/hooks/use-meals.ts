"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MealInput, NutritionGoals } from "@vitalia/shared-types";
import { QUERY_KEYS } from "@/lib/constants";
import {
  createMeal,
  deleteMeal,
  fetchDailySummary,
  fetchGoals,
  fetchMeals,
  fetchSuggestions,
  updateGoals as updateGoalsApi,
} from "@/lib/api/nutrition";
import { toast } from "@/stores/use-notification-store";
import { apiErrorMessage } from "@/lib/utils";

export function useMeals(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.meals(date),
    queryFn: () => fetchMeals(date),
  });
}

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dailySummary(date),
    queryFn: () => fetchDailySummary(date),
  });
}

export function useSuggestions() {
  return useQuery({
    queryKey: QUERY_KEYS.suggestions,
    queryFn: fetchSuggestions,
  });
}

export function useGoals() {
  return useQuery({
    queryKey: QUERY_KEYS.goals,
    queryFn: fetchGoals,
  });
}

export function useMealMutations() {
  const queryClient = useQueryClient();

  const invalidateDay = (date: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.meals(date) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailySummary(date) });
  };

  const create = useMutation({
    mutationFn: (input: MealInput) => createMeal(input),
    onSuccess: (meal) => {
      invalidateDay(meal.date);
      toast.success("Comida registrada", meal.food_name);
    },
    onError: (error) => toast.error("No se pudo registrar la comida", apiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      deleteMeal(id).then(() => date),
    onSuccess: (date) => {
      invalidateDay(date);
      toast.success("Comida eliminada");
    },
    onError: (error) => toast.error("No se pudo eliminar", apiErrorMessage(error)),
  });

  const updateGoals = useMutation<NutritionGoals, Error, Partial<NutritionGoals>>({
    mutationFn: (input: Partial<NutritionGoals>) => updateGoalsApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals });
      toast.success("Metas actualizadas");
    },
    onError: (error) => toast.error("No se actualizaron las metas", apiErrorMessage(error)),
  });

  return { create, remove, updateGoals };
}
