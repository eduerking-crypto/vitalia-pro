"""User & auth schemas."""

from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from datetime import date
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str
    date_of_birth: date | None = None
    biological_sex: str | None = None
    role: str
    is_active: bool
    mfa_enabled: bool
    created_at: datetime
    updated_at: datetime


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponse(AuthTokens):
    user: UserOut
    mfa_required: bool | None = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)
    date_of_birth: date


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    mfa_code: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    date_of_birth: date | None = None
    biological_sex: str | None = None


class MedicalProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    blood_type: str | None
    height_cm: float | None
    weight_kg: float | None
    chronic_conditions: list[str]
    family_history: list[str]
    emergency_contact_name: str | None
    emergency_contact_phone: str | None
    insurance_provider: str | None
    insurance_policy: str | None
    allergies: list["AllergyOut"] = []


class MedicalProfileUpdate(BaseModel):
    blood_type: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    chronic_conditions: list[str] | None = None
    family_history: list[str] | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    insurance_provider: str | None = None
    insurance_policy: str | None = None


class AllergyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    profile_id: UUID
    allergen: str
    severity: str
    reaction: str | None


class AllergyCreate(BaseModel):
    allergen: str = Field(min_length=1)
    severity: str = "moderate"
    reaction: str | None = None


class UserSettingsOut(BaseModel):
    theme: str = "system"
    language: str = "es"
    notifications: dict[str, bool]
    units: dict[str, str]
    privacy: dict[str, bool]


class UserSettingsUpdate(BaseModel):
    theme: str | None = None
    language: str | None = None
    notifications: dict[str, bool] | None = None
    units: dict[str, str] | None = None
    privacy: dict[str, bool] | None = None


MedicalProfileOut.model_rebuild()
