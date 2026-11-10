"""Medication schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MedicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    active_ingredient: str
    dosage: str
    frequency: str
    time: str
    instructions: str
    start_date: str
    end_date: str | None
    is_active: bool
    reminder_enabled: bool
    remaining_quantity: int
    rxnorm_code: str
    prescribed_by: str


class MedicationCreate(BaseModel):
    name: str = Field(min_length=1)
    active_ingredient: str = Field(min_length=1)
    dosage: str = Field(min_length=1)
    frequency: str = "once_daily"
    time: str
    instructions: str | None = ""
    start_date: str
    end_date: str | None = None
    reminder_enabled: bool = True
    remaining_quantity: int = 0
    prescribed_by: str | None = ""


class MedicationUpdate(BaseModel):
    name: str | None = None
    active_ingredient: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    time: str | None = None
    instructions: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    is_active: bool | None = None
    reminder_enabled: bool | None = None
    remaining_quantity: int | None = None
    prescribed_by: str | None = None


class MedicationLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    medication_id: str
    taken_at: str
    status: str


class DrugInteractionOut(BaseModel):
    medication_a: str
    medication_b: str
    severity: str
    description: str
    recommendation: str


class InteractionCheckOut(BaseModel):
    interactions: list[DrugInteractionOut]
    checked_at: str


class AdherenceMedicationOut(BaseModel):
    medication_id: str
    name: str
    adherence_rate: float


class AdherenceStatsOut(BaseModel):
    period_days: int
    expected_doses: int
    taken_doses: int
    skipped_doses: int
    late_doses: int
    adherence_rate: float
    by_medication: list[AdherenceMedicationOut] = []
