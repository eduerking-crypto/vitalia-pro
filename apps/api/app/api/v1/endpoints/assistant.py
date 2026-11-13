"""Assistant (IA) endpoints."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

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
    context = {
        "user_id": str(current_user.id),
        "full_name": current_user.full_name,
        "role": current_user.role,
    }
    result = await run_assistant(data.message, str(current_user.id), context)
    message = {
        "id": uuid4(),
        "user_id": current_user.id,
        "role": "assistant",
        "content": result["reply"],
        "agent": result["agent"],
        "created_at": datetime.now(timezone.utc),
    }
    return {
        "message": message,
        "agent_used": result["agent"],
        "agent_reasoning": result["reasoning"],
        "disclaimers": result["disclaimers"],
    }


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
