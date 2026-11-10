"""Appointment endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.services import appointment_service
from app.schemas import AppointmentOut, AppointmentCreate, AppointmentUpdate

router = APIRouter()


@router.get("/appointments", response_model=list[AppointmentOut])
async def list_appointments(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await appointment_service.list_appointments(session, str(current_user.id))


@router.post("/appointments", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    data: AppointmentCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await appointment_service.create_appointment(session, str(current_user.id), data)


@router.put("/appointments/{appointment_id}", response_model=AppointmentOut)
async def update_appointment(
    appointment_id: str,
    data: AppointmentUpdate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    appt = await appointment_service.get_appointment(session, appointment_id, str(current_user.id))
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")
    return await appointment_service.update_appointment(session, appt, data)


@router.delete("/appointments/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_appointment(
    appointment_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> None:
    appt = await appointment_service.get_appointment(session, appointment_id, str(current_user.id))
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")
    await appointment_service.cancel_appointment(session, appt)


@router.get("/appointments/specialties", response_model=list[dict[str, Any]])
async def specialties() -> Any:
    return [
        {"id": "familiar", "name": "Medicina Familiar", "description": "Atención primaria y seguimiento crónico", "icon": "Stethoscope", "next_available": "2026-11-12", "doctors_available": 14},
        {"id": "cardiologia", "name": "Cardiología", "description": "Corazón, tensión arterial y ritmo", "icon": "HeartPulse", "next_available": "2026-11-13", "doctors_available": 6},
        {"id": "endocrinologia", "name": "Endocrinología", "description": "Diabetes, tiroides y metabolismo", "icon": "FlaskConical", "next_available": "2026-11-18", "doctors_available": 4},
        {"id": "nutricion", "name": "Nutrición", "description": "Dietas personalizadas y peso saludable", "icon": "Apple", "next_available": "2026-11-11", "doctors_available": 9},
        {"id": "dermatologia", "name": "Dermatología", "description": "Piel, pelo y uñas", "icon": "Sparkles", "next_available": "2026-11-13", "doctors_available": 5},
        {"id": "psicologia", "name": "Psicología", "description": "Ansiedad, estrés y bienestar mental", "icon": "Brain", "next_available": "2026-11-12", "doctors_available": 11},
    ]
