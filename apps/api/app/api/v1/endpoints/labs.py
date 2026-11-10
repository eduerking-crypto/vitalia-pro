"""Lab results endpoints."""

from __future__ import annotations

from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.models.medical import LabResult
from sqlalchemy import select
from app.schemas import LabResultOut, LabResultCreate

router = APIRouter()


@router.get("/labs", response_model=list[LabResultOut])
async def list_labs(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    result = await session.execute(
        select(LabResult).where(LabResult.user_id == current_user.id).order_by(LabResult.date.desc())
    )
    return result.scalars().all()


@router.get("/labs/{lab_id}", response_model=LabResultOut)
async def get_lab(
    lab_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    result = await session.execute(
        select(LabResult).where(LabResult.id == lab_id, LabResult.user_id == current_user.id)
    )
    lab = result.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Resultado no encontrado.")
    return lab


@router.post("/labs", response_model=LabResultOut, status_code=status.HTTP_201_CREATED)
async def create_lab(
    data: LabResultCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    from uuid import uuid4
    lab = LabResult(
        id=uuid4(),
        user_id=current_user.id,
        test_name=data.test_name,
        lab_name=data.lab_name,
        date=date.fromisoformat(data.date),
        status="review",
        values=[m.model_dump() for m in data.values],
    )
    session.add(lab)
    await session.flush()
    await session.refresh(lab)
    return lab
