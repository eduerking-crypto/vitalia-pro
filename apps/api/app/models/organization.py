"""Modelos multiempresa: organizaciones (IPS/clínicas), equipo y pacientes."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.types import UUIDStr


class Organization(Base):
    """Empresa cliente: IPS, clínica, aseguradora o red de salud."""

    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(UUIDStr(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    tax_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    country: Mapped[str | None] = mapped_column(String(80), nullable=True)
    sector: Mapped[str | None] = mapped_column(String(80), nullable=True)
    plan: Mapped[str] = mapped_column(String(32), default="pro", nullable=False)
    seats: Mapped[int] = mapped_column(Integer, default=250, nullable=False)
    primary_color: Mapped[str] = mapped_column(String(16), default="#4E7B84", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    members: Mapped[list["OrganizationMember"]] = relationship(
        back_populates="organization", cascade="all, delete-orphan"
    )
    patients: Mapped[list["OrganizationPatient"]] = relationship(
        back_populates="organization", cascade="all, delete-orphan"
    )


class OrganizationMember(Base):
    """Profesional o administrador que pertenece a una organización."""

    __tablename__ = "organization_members"

    id: Mapped[uuid.UUID] = mapped_column(UUIDStr(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(
        UUIDStr(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUIDStr(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(32), default="professional", nullable=False)
    specialty: Mapped[str | None] = mapped_column(String(120), nullable=True)
    license_number: Mapped[str | None] = mapped_column(String(80), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped[Organization] = relationship(back_populates="members")


class OrganizationPatient(Base):
    """Vinculación paciente ↔ organización, con profesional asignado y riesgo."""

    __tablename__ = "organization_patients"

    id: Mapped[uuid.UUID] = mapped_column(UUIDStr(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(
        UUIDStr(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUIDStr(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    professional_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDStr(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    risk_level: Mapped[str] = mapped_column(String(16), default="low", nullable=False)
    cohort: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped[Organization] = relationship(back_populates="patients")
