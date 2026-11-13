"""Schemas del portal de empresa (IPS/clínica)."""

from __future__ import annotations

from datetime import date, datetime, time
from uuid import UUID

from pydantic import BaseModel


class OrgOut(BaseModel):
    id: UUID
    name: str
    slug: str
    plan: str
    seats: int
    city: str | None = None
    country: str | None = None
    sector: str | None = None
    primary_color: str
    tax_id: str | None = None
    is_active: bool


class OrgMemberOut(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str
    email: str
    role: str
    specialty: str | None = None
    license_number: str | None = None
    phone: str | None = None
    is_active: bool
    patients_count: int = 0
    appointments_week: int = 0


class OrgPatientOut(BaseModel):
    id: UUID
    full_name: str
    email: str
    risk_level: str
    cohort: str | None = None
    professional_name: str | None = None
    last_vital_at: datetime | None = None
    last_systolic: int | None = None
    last_diastolic: int | None = None
    last_heart_rate: int | None = None
    adherence_rate: float = 0.0
    medications_active: int = 0
    next_appointment: datetime | None = None


class OrgAppointmentOut(BaseModel):
    id: UUID
    patient_name: str
    professional_name: str | None = None
    specialty: str
    date: date
    time: time
    modality: str
    status: str


class OrgKpiPoint(BaseModel):
    label: str
    value: float


class OrgSummaryOut(BaseModel):
    organization: OrgOut
    patients_total: int
    professionals_total: int
    appointments_week: int
    adherence_rate: float
    high_risk: int
    alerts: int
    active_patients_7d: int
    risk_distribution: list[OrgKpiPoint]
    adherence_series: list[OrgKpiPoint]
    consultations_series: list[OrgKpiPoint]


class OrgAuditOut(BaseModel):
    id: int
    action: str
    resource_type: str
    resource_id: str
    timestamp: datetime
    actor_name: str | None = None


class OrgReportOut(BaseModel):
    adherence_by_professional: list[OrgKpiPoint]
    patients_by_cohort: list[OrgKpiPoint]
    top_conditions: list[OrgKpiPoint]
    avg_adherence: float
    avg_systolic: float
    avg_glucose: float
