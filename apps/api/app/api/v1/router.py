"""API router v1 - aggregates all endpoint modules."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    medications,
    nutrition,
    appointments,
    assistant,
    health,
    labs,
    documents,
    notifications,
    settings,
)

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router, tags=["auth"])
router.include_router(users.router, tags=["users"])
router.include_router(medications.router, tags=["medications"])
router.include_router(nutrition.router, tags=["nutrition"])
router.include_router(appointments.router, tags=["appointments"])
router.include_router(assistant.router, tags=["assistant"])
router.include_router(health.router, tags=["health"])
router.include_router(labs.router, tags=["labs"])
router.include_router(documents.router, tags=["documents"])
router.include_router(notifications.router, tags=["notifications"])
router.include_router(settings.router, tags=["settings"])
