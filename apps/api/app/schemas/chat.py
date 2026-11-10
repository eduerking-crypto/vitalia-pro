"""Chat / assistant schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    role: str
    content: str
    agent: str | None
    created_at: str


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    message: ChatMessageOut
    agent_used: str
    agent_reasoning: str
    disclaimers: list[str]
