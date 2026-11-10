"""Meal & nutrition schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MealOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    date: str
    meal_type: str
    food_name: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float | None
    notes: str | None
    image_url: str | None


class MealCreate(BaseModel):
    date: str
    meal_type: str = "breakfast"
    food_name: str = Field(min_length=1)
    calories: int = Field(ge=0)
    protein_g: float = Field(ge=0)
    carbs_g: float = Field(ge=0)
    fat_g: float = Field(ge=0)
    fiber_g: float | None = 0
    notes: str | None = ""
    image_url: str | None = None


class DailySummaryOut(BaseModel):
    date: str
    total_calories: int
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fiber_g: float
    meals_count: int


class NutritionGoalsOut(BaseModel):
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    water_ml: int


class NutritionGoalsUpdate(BaseModel):
    calories: int | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    water_ml: int | None = None


class NutritionSuggestionOut(BaseModel):
    id: str
    title: str
    description: str
    meal_type: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    reason: str
