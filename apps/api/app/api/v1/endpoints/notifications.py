"""Notification endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.models.audit import Notification

router = APIRouter()


@router.get("/notifications", response_model=list[dict[str, Any]])
async def list_notifications(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    result = await session.execute(
        select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/notifications/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_read(
    notification_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> None:
    result = await session.execute(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == current_user.id)
    )
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Notificación no encontrada.")
    n.is_read = True
    await session.flush()


@router.patch("/notifications/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_read(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> None:
    await session.execute(
        Notification.__table__.update().where(Notification.user_id == current_user.id).values(is_read=True)
    )
    await session.flush()
