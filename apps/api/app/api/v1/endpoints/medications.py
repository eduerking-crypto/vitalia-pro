"""Medication endpoints."""

from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.core.audit import record as audit_record
from app.models.medication import Medication
from app.services import medication_service
from app.schemas import (
    MedicationOut, MedicationCreate, MedicationUpdate,
    InteractionCheckOut, AdherenceStatsOut,
)

router = APIRouter()


@router.get("/medications", response_model=list[MedicationOut])
async def list_medications(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await medication_service.list_medications(session, str(current_user.id))


@router.post("/medications", response_model=MedicationOut, status_code=status.HTTP_201_CREATED)
async def create_medication(
    request: Request,
    data: MedicationCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    med = await medication_service.create_medication(session, str(current_user.id), data)
    await audit_record(
        session,
        actor_id=str(current_user.id),
        action="medication_created",
        resource_type="medication",
        resource_id=str(med.id),
        ip_address=request.client.host if request.client else None,
    )
    return med


@router.put("/medications/{medication_id}", response_model=MedicationOut)
async def update_medication(
    medication_id: str,
    data: MedicationUpdate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    med = await medication_service.get_medication(session, medication_id, str(current_user.id))
    if not med:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado.")
    return await medication_service.update_medication(session, med, data)


@router.delete("/medications/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication(
    medication_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> None:
    med = await medication_service.get_medication(session, medication_id, str(current_user.id))
    if not med:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado.")
    await medication_service.delete_medication(session, med)


@router.patch("/medications/{medication_id}/taken", status_code=status.HTTP_200_OK)
async def mark_taken(
    medication_id: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    try:
        body = await request.json()
    except Exception:
        body = {}
    status_value = str(body.get("status") or "taken")
    med = await medication_service.get_medication(session, medication_id, str(current_user.id))
    if not med:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado.")
    await medication_service.mark_taken(session, med, status_value)
    return {"ok": True}


@router.get("/medications/interactions", response_model=InteractionCheckOut)
async def interactions(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await medication_service.check_interactions(session, str(current_user.id))


@router.get("/medications/adherence", response_model=AdherenceStatsOut)
async def adherence(
    days: int = Query(30, ge=1, le=365),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    return await medication_service.adherence_stats(session, str(current_user.id), days)
