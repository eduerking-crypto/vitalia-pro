"""Document schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    filename: str
    document_type: str
    file_url: str
    file_size: int
    uploaded_at: str
    shared_with: list[str]


class DocumentCreate(BaseModel):
    filename: str
    document_type: str = "Otro"
    file_size: int = 0


class DocumentShareOut(BaseModel):
    document_id: str
    share_url: str
    expires_at: str
