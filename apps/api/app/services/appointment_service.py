"""Appointment service."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


async def list_appointments(session: AsyncSession, user_id: str) -> list[Appointment]:
    result = await session.execute(
        select(Appointment).where(Appointment.user_id == user_id).order_by(Appointment.date, Appointment.time)
    )
    return result.scalars().all()


async def get_appointment(session: AsyncSession, appointment_id: str, user_id: str) -> Appointment | None:
    result = await session.execute(
        select(Appointment).where(Appointment.id == appointment_id, Appointment.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def create_appointment(session: AsyncSession, user_id: str, data: AppointmentCreate) -> Appointment:
    appointment = Appointment(user_id=user_id, **data.model_dump())
    session.add(appointment)
    await session.flush()
    await session.refresh(appointment)
    return appointment


async def update_appointment(
    session: AsyncSession, appointment: Appointment, data: AppointmentUpdate
) -> Appointment:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(appointment, field, value)
    await session.flush()
    await session.refresh(appointment)
    return appointment


async def cancel_appointment(session: AsyncSession, appointment: Appointment) -> None:
    await session.delete(appointment)
