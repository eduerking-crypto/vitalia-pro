"""Document schemas."""

from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    filename: str
    document_type: str
    file_url: str
    file_size: int
    uploaded_at: datetime
    shared_with: list[str]


class DocumentCreate(BaseModel):
    filename: str
    document_type: str = "Otro"
    file_size: int = 0


class DocumentShareOut(BaseModel):
    document_id: str
    share_url: str
    expires_at: str
