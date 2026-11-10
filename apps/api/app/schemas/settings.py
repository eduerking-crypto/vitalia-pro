"""Settings schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class SettingsOut(BaseModel):
    theme: str = "system"
    language: str = "es"
    notifications: dict[str, bool]
    units: dict[str, str]
    privacy: dict[str, bool]


class SettingsUpdate(BaseModel):
    theme: str | None = None
    language: str | None = None
    notifications: dict[str, bool] | None = None
    units: dict[str, str] | None = None
    privacy: dict[str, bool] | None = None
