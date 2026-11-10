"""Nutrition service: meals, summary, goals, suggestions."""

from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.meal import Meal
from app.schemas.meal import MealCreate


async def list_meals(session: AsyncSession, user_id: str, day: date) -> list[Meal]:
    result = await session.execute(
        select(Meal).where(Meal.user_id == user_id, Meal.date == day).order_by(Meal.meal_type)
    )
    return result.scalars().all()


async def create_meal(session: AsyncSession, user_id: str, data: MealCreate) -> Meal:
    meal = Meal(user_id=user_id, **data.model_dump())
    session.add(meal)
    await session.flush()
    await session.refresh(meal)
    return meal


async def delete_meal(session: AsyncSession, meal_id: str, user_id: str) -> bool:
    result = await session.execute(
        select(Meal).where(Meal.id == meal_id, Meal.user_id == user_id)
    )
    meal = result.scalar_one_or_none()
    if not meal:
        return False
    await session.delete(meal)
    return True


async def daily_summary(session: AsyncSession, user_id: str, day: date) -> dict[str, Any]:
    meals = await list_meals(session, user_id, day)
    return {
        "date": day.isoformat(),
        "total_calories": sum(m.calories for m in meals),
        "total_protein_g": round(sum(m.protein_g for m in meals), 1),
        "total_carbs_g": round(sum(m.carbs_g for m in meals), 1),
        "total_fat_g": round(sum(m.fat_g for m in meals), 1),
        "total_fiber_g": round(sum(m.fiber_g or 0 for m in meals), 1),
        "meals_count": len(meals),
    }


GOALS_DEFAULTS = {"calories": 2000, "protein_g": 120, "carbs_g": 220, "fat_g": 65, "water_ml": 2000}


async def suggestions(session: AsyncSession, user_id: str, day: date) -> list[dict[str, Any]]:
    """Heuristic nutrition suggestions when no OpenAI key is configured."""
    meals = await list_meals(session, user_id, day)
    eaten_calories = sum(m.calories for m in meals)
    target = GOALS_DEFAULTS["calories"]
    gap = target - eaten_calories

    out: list[dict[str, Any]] = []
    if gap > 150:
        out.append(
            {
                "id": "sug-snack",
                "title": "Merienda ligera",
                "description": "Yogur griego con frutos rojos y un puñado de almendras.",
                "meal_type": "snack",
                "calories": min(gap, 250),
                "protein_g": 10,
                "carbs_g": 20,
                "fat_g": 8,
                "reason": "Te faltan calorías para alcanzar tu meta diaria.",
            }
        )
    protein = sum(m.protein_g for m in meals)
    if protein < GOALS_DEFAULTS["protein_g"] * 0.7:
        out.append(
            {
                "id": "sug-protein",
                "title": "Refuerzo proteico",
                "description": "Añade pechuga de pavo, huevo o legumbres a tu próxima comida.",
                "meal_type": "lunch",
                "calories": 120,
                "protein_g": 18,
                "carbs_g": 8,
                "fat_g": 3,
                "reason": "Tu consumo de proteína está por debajo del objetivo.",
            }
        )
    if not out:
        out.append(
            {
                "id": "sug-maintain",
                "title": "Mantén el ritmo",
                "description": "Tu día está equilibrado. Sigue hidratándote.",
                "meal_type": "snack",
                "calories": 80,
                "protein_g": 3,
                "carbs_g": 12,
                "fat_g": 2,
                "reason": "Estás cerca de tus metas nutricionales del día.",
            }
        )
    return out
