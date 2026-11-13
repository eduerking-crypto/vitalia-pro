"""Assistant (IA) endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.agents.router import run_assistant
from app.schemas import ChatRequest, ChatResponse, ChatMessageOut

router = APIRouter()


@router.post("/assistant/chat", response_model=ChatResponse)
async def assistant_chat(
    data: ChatRequest,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    from sqlalchemy import select
    result = await session.execute(
        select(_).where(_.id == current_user.id)
    )
    user = result.scalar_one_or_none()
    context = {
        "user_id": str(current_user.id),
        "full_name": user.full_name if user else "",
        "role": current_user.role,
    }
    return await run_assistant(data.message, str(current_user.id), context)


@router.get("/assistant/history", response_model=list[ChatMessageOut])
async def assistant_history(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    # In-memory demo history is not persisted yet; return empty list.
    return []


@router.delete("/assistant/history", status_code=status.HTTP_204_NO_CONTENT)
async def clear_history() -> None:
    return None
