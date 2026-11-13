"""Medication models."""

from __future__ import annotations

import uuid
from datetime import date, datetime, time
from typing import Any

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, Time, func
from app.core.types import UUIDStr
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[uuid.UUID] = mapped_column(UUIDStr(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUIDStr(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_ingredient: Mapped[str] = mapped_column(String(255), nullable=False)
    dosage: Mapped[str] = mapped_column(String(128), nullable=False)
    frequency: Mapped[str] = mapped_column(String(64), nullable=False)
    time: Mapped[time] = mapped_column(Time, nullable=False)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    reminder_enabled: Mapped[bool] = mapped_column(default=True)
    remaining_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    rxnorm_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    prescribed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="medications")
    logs: Mapped[list["MedicationLog"]] = relationship(back_populates="medication", cascade="all, delete-orphan")


class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUIDStr(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medication_id: Mapped[uuid.UUID] = mapped_column(UUIDStr(as_uuid=True), ForeignKey("medications.id", ondelete="CASCADE"), nullable=False)
    taken_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    medication: Mapped[Medication] = relationship(back_populates="logs")
