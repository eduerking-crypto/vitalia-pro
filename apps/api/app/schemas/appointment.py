"""Appointment schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class AppointmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    doctor_name: str
    specialty: str
    date: str
    time: str
    modality: str
    status: str
    reason: str | None
    notes: str | None


class AppointmentCreate(BaseModel):
    doctor_name: str
    specialty: str
    date: str
    time: str
    modality: str = "video"
    reason: str | None = ""
    notes: str | None = ""


class AppointmentUpdate(BaseModel):
    doctor_name: str | None = None
    specialty: str | None = None
    date: str | None = None
    time: str | None = None
    modality: str | None = None
    status: str | None = None
    reason: str | None = None
    notes: str | None = None


class SpecialtyOut(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    next_available: str
    doctors_available: int
