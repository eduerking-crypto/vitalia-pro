"""Document endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.models.medical import Document
from sqlalchemy import select
from app.schemas import DocumentOut, DocumentCreate, DocumentShareOut

router = APIRouter()


@router.get("/documents", response_model=list[DocumentOut])
async def list_documents(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    result = await session.execute(
        select(Document).where(Document.user_id == current_user.id).order_by(Document.uploaded_at.desc())
    )
    return result.scalars().all()


@router.post("/documents", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def create_document(
    data: DocumentCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    from uuid import uuid4
    from datetime import datetime, timezone
    doc = Document(
        id=uuid4(),
        user_id=current_user.id,
        filename=data.filename,
        document_type=data.document_type,
        file_url="#",
        file_size=data.file_size,
        uploaded_at=datetime.now(timezone.utc),
        shared_with=[],
    )
    session.add(doc)
    await session.flush()
    await session.refresh(doc)
    return doc


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> None:
    result = await session.execute(
        select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado.")
    await session.delete(doc)


@router.post("/documents/share", response_model=DocumentShareOut)
async def share_document(
    data: dict,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> Any:
    from datetime import datetime, timedelta, timezone
    expires = datetime.now(timezone.utc) + timedelta(days=7)
    return {
        "document_id": data.get("document_id", ""),
        "share_url": f"https://vitalia.health/s/{data.get('document_id', 'demo')}",
        "expires_at": expires.isoformat(),
    }
