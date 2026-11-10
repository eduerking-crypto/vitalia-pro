import type {
  DailySummary,
  Meal,
  MealInput,
  NutritionGoals,
  NutritionSuggestion,
} from "@vitalia/shared-types";
import { api } from "./client";

export async function fetchMeals(date: string): Promise<Meal[]> {
  const { data } = await api.get<Meal[]>("/meals", { params: { date } });
  return data;
}

export async function createMeal(input: MealInput): Promise<Meal> {
  const { data } = await api.post<Meal>("/meals", input);
  return data;
}

export async function deleteMeal(id: string): Promise<void> {
  await api.delete(`/meals/${id}`);
}

export async function fetchDailySummary(date: string): Promise<DailySummary> {
  const { data } = await api.get<DailySummary>("/nutrition/daily-summary", {
    params: { date },
  });
  return data;
}

export async function fetchSuggestions(): Promise<NutritionSuggestion[]> {
  const { data } = await api.get<NutritionSuggestion[]>("/nutrition/suggestions");
  return data;
}

export async function fetchGoals(): Promise<NutritionGoals> {
  const { data } = await api.get<NutritionGoals>("/nutrition/goals");
  return data;
}

export async function updateGoals(input: Partial<NutritionGoals>): Promise<NutritionGoals> {
  const { data } = await api.put<NutritionGoals>("/nutrition/goals", input);
  return data;
}
