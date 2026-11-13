"""Health schemas."""

from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class VitalSignOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    recorded_at: datetime
    systolic_bp: int | None
    diastolic_bp: int | None
    heart_rate: int | None
    temperature: float | None
    oxygen_saturation: int | None
    glucose: int | None
    weight_kg: float | None


class VitalSignCreate(BaseModel):
    recorded_at: datetime | None = None
    systolic_bp: int
    diastolic_bp: int
    heart_rate: int
    temperature: float | None = None
    oxygen_saturation: int | None = None
    glucose: int | None = None
    weight_kg: float | None = None


class SleepRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    date: date
    duration_minutes: int
    deep_sleep_minutes: int
    rem_sleep_minutes: int
    light_sleep_minutes: int
    awake_minutes: int
    efficiency: float | None
    notes: str | None


class MoodRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    date: date
    mood: int
    emoji: str | None
    notes: str | None


class MoodRecordCreate(BaseModel):
    mood: int = Field(ge=1, le=5)
    emoji: str | None = None
    notes: str | None = None


class HealthScoreComponentOut(BaseModel):
    key: str
    name: str
    value: float
    weight: float


class HealthScoreOut(BaseModel):
    score: int
    label: str
    components: list[HealthScoreComponentOut]
    computed_at: datetime | None = None



MoodRecordCreate.model_rebuild()
