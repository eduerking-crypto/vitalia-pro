import type { UUID } from "./index";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Meal {
  id: UUID;
  user_id: UUID;
  date: string; // ISO date
  meal_type: MealType;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  notes: string;
  image_url: string | null;
}

export interface MealInput {
  date: string;
  meal_type: MealType;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  notes?: string;
  image_url?: string | null;
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  meals_count: number;
}

export interface NutritionGoals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
}

export interface NutritionSuggestion {
  id: string;
  title: string;
  description: string;
  meal_type: MealType;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  reason: string;
}
