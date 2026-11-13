"""Appointment schemas."""

from __future__ import annotations

from datetime import date as DateType, datetime, time as TimeType
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AppointmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    doctor_name: str
    specialty: str
    date: DateType
    time: TimeType
    modality: str
    status: str
    reason: str | None
    notes: str | None


class AppointmentCreate(BaseModel):
    doctor_name: str
    specialty: str
    date: DateType
    time: TimeType
    modality: str = "video"
    reason: str | None = ""
    notes: str | None = ""


class AppointmentUpdate(BaseModel):
    doctor_name: str | None = None
    specialty: str | None = None
    date: DateType | None = None
    time: TimeType | None = None
    modality: str | None = None
    status: str | None = None
    reason: str | None = None
    notes: str | None = None


class SpecialtyOut(BaseModel):
    id: UUID
    name: str
    description: str
    icon: str
    next_available: str
    doctors_available: int

AppointmentOut.model_rebuild()
SpecialtyOut.model_rebuild()
