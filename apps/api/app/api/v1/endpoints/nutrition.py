"""Nutrition endpoints."""

from __future__ import annotations

from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.services import nutrition_service
from app.schemas import MealOut, MealCreate, DailySummaryOut, NutritionGoalsOut, NutritionGoalsUpdate, NutritionSuggestionOut

router = APIRouter()


@router.get("/meals", response_model=list[MealOut])
async def list_meals(
    day: str = Query(..., description="YYYY-MM-DD"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await nutrition_service.list_meals(session, str(current_user.id), date.fromisoformat(day))


@router.post("/meals", response_model=MealOut, status_code=status.HTTP_201_CREATED)
async def create_meal(
    data: MealCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await nutrition_service.create_meal(session, str(current_user.id), data)


@router.delete("/meals/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meal(
    meal_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> None:
    ok = await nutrition_service.delete_meal(session, meal_id, str(current_user.id))
    if not ok:
        raise HTTPException(status_code=404, detail="Comida no encontrada.")


@router.get("/nutrition/daily-summary", response_model=DailySummaryOut)
async def daily_summary(
    day: str = Query(..., description="YYYY-MM-DD"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await nutrition_service.daily_summary(session, str(current_user.id), date.fromisoformat(day))


@router.get("/nutrition/suggestions", response_model=list[NutritionSuggestionOut])
async def suggestions(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await nutrition_service.suggestions(session, str(current_user.id), date.today())


@router.get("/nutrition/goals", response_model=NutritionGoalsOut)
async def get_goals(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return nutrition_service.GOALS_DEFAULTS


@router.put("/nutrition/goals", response_model=NutritionGoalsOut)
async def update_goals(
    data: NutritionGoalsUpdate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    goals = dict(nutrition_service.GOALS_DEFAULTS)
    for field, value in data.model_dump(exclude_unset=True).items():
        goals[field] = value
    return goals
