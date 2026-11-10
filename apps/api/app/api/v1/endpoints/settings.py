"""Settings endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.schemas import SettingsOut, SettingsUpdate

router = APIRouter()


@router.get("/settings", response_model=SettingsOut)
async def get_settings(
    current_user=Depends(get_current_user),
) -> Any:
    return {
        "theme": "system",
        "language": "es",
        "notifications": {
            "medications": True,
            "appointments": True,
            "achievements": True,
            "weekly_report": False,
        },
        "units": {"weight": "kg", "temperature": "c", "distance": "km"},
        "privacy": {"share_anonymized_data": False, "allow_ai_suggestions": True},
    }


@router.put("/settings", response_model=SettingsOut)
async def update_settings(
    data: SettingsUpdate,
    current_user=Depends(get_current_user),
) -> Any:
    base = {
        "theme": "system",
        "language": "es",
        "notifications": {
            "medications": True,
            "appointments": True,
            "achievements": True,
            "weekly_report": False,
        },
        "units": {"weight": "kg", "temperature": "c", "distance": "km"},
        "privacy": {"share_anonymized_data": False, "allow_ai_suggestions": True},
    }
    for field, value in data.model_dump(exclude_unset=True).items():
        if isinstance(value, dict):
            base[field] = {**base.get(field, {}), **value}
        else:
            base[field] = value
    return base
