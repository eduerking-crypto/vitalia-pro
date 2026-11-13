"""Chat / assistant schemas."""

from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from typing import Any

from pydantic import BaseModel, ConfigDict


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    role: str
    content: str
    agent: str | None
    created_at: datetime


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    message: ChatMessageOut
    agent_used: str
    agent_reasoning: str
    disclaimers: list[str]
