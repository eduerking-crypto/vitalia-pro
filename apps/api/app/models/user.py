"""User, MedicalProfile and Allergy models."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from sqlalchemy import Date, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    biological_sex: Mapped[str | None] = mapped_column(String(32), nullable=True)
    role: Mapped[str] = mapped_column(String(32), nullable=False, default="patient")
    is_active: Mapped[bool] = mapped_column(default=True)
    mfa_secret: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mfa_enabled: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    medical_profile: Mapped["MedicalProfile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    medications: Mapped[list["Medication"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    meals: Mapped[list["Meal"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    vital_signs: Mapped[list["VitalSign"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    sleep_records: Mapped[list["SleepRecord"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    mood_records: Mapped[list["MoodRecord"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    lab_results: Mapped[list["LabResult"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    documents: Mapped[list["Document"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": str(self.id),
            "email": self.email,
            "full_name": self.full_name,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "biological_sex": self.biological_sex,
            "role": self.role,
            "is_active": self.is_active,
            "mfa_enabled": self.mfa_enabled,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class MedicalProfile(Base):
    __tablename__ = "medical_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    blood_type: Mapped[str | None] = mapped_column(String(8), nullable=True)
    height_cm: Mapped[float | None] = mapped_column(nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(nullable=True)
    chronic_conditions: Mapped[list[str]] = mapped_column(JSONB(astext_type=Any), default=list, server_default="[]")
    family_history: Mapped[list[str]] = mapped_column(JSONB(astext_type=Any), default=list, server_default="[]")
    emergency_contact_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    emergency_contact_phone_enc: Mapped[str | None] = mapped_column(nullable=True)
    insurance_provider: Mapped[str | None] = mapped_column(String(255), nullable=True)
    insurance_policy: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped[User] = relationship(back_populates="medical_profile")
    allergies: Mapped[list["Allergy"]] = relationship(back_populates="profile", cascade="all, delete-orphan")


class Allergy(Base):
    __tablename__ = "allergies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("medical_profiles.id", ondelete="CASCADE"), nullable=False)
    allergen: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), nullable=False)
    reaction: Mapped[str | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    profile: Mapped[MedicalProfile] = relationship(back_populates="allergies")
