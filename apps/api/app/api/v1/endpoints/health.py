"""Health endpoints (vitals, sleep, mood, score)."""

from __future__ import annotations

from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.services import health_service
from app.schemas import VitalSignOut, VitalSignCreate, SleepRecordOut, MoodRecordOut, MoodRecordCreate, HealthScoreOut

router = APIRouter()


@router.get("/health/vitals", response_model=list[VitalSignOut])
async def list_vitals(
    days: int = Query(30, ge=1, le=365),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await health_service.list_vitals(session, str(current_user.id), days)


@router.post("/health/vitals", response_model=VitalSignOut, status_code=status.HTTP_201_CREATED)
async def record_vitals(
    data: VitalSignCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await health_service.record_vitals(session, str(current_user.id), data, None)


@router.get("/health/sleep", response_model=list[SleepRecordOut])
async def list_sleep(
    days: int = Query(14, ge=1, le=365),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await health_service.list_sleep(session, str(current_user.id), days)


@router.post("/health/sleep", response_model=SleepRecordOut, status_code=status.HTTP_201_CREATED)
async def record_sleep(
    data: dict,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await health_service.record_sleep(session, str(current_user.id), data)


@router.get("/health/mood", response_model=list[MoodRecordOut])
async def list_mood(
    days: int = Query(14, ge=1, le=365),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await health_service.list_mood(session, str(current_user.id), days)


@router.post("/health/mood", response_model=MoodRecordOut, status_code=status.HTTP_201_CREATED)
async def record_mood(
    data: MoodRecordCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await health_service.record_mood(session, str(current_user.id), data)


@router.get("/health/score", response_model=HealthScoreOut)
async def health_score(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await health_service.health_score(session, str(current_user.id))
