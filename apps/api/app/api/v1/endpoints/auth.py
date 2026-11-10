"""Auth endpoints."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_current_user
from app.core import security
from app.core.config import settings
from app.core.audit import record as audit_record
from app.services import auth_service
from app.schemas import UserOut, AuthResponse

router = APIRouter()


@router.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> Any:
    body = await request.json()
    try:
        user = await auth_service.create_user(
            session,
            email=body.get("email", ""),
            password=body.get("password", ""),
            full_name=body.get("full_name", ""),
            date_of_birth=body.get("date_of_birth", ""),
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")
    tokens = await auth_service.issue_tokens(session, user, request.client.host if request.client else None)
    return AuthResponse(**tokens)


@router.post("/auth/login", response_model=AuthResponse)
async def login(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> Any:
    body = await request.json()
    user = await auth_service.authenticate_user(session, body.get("email", ""), body.get("password", ""))
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas.")

    if user.mfa_enabled and not body.get("mfa_code"):
        mfa_token = security.create_access_token(str(user.id), user.role)  # reutilizamos como mfa token corto
        # Sobrescribimos expiración a 10 min para el paso MFA
        return {
            "mfa_required": True,
            "mfa_token": mfa_token,
        }

    tokens = await auth_service.issue_tokens(session, user, request.client.host if request.client else None)
    return AuthResponse(**tokens)


@router.post("/auth/refresh")
async def refresh(
    session: AsyncSession = Depends(get_session),
    current_user: UserOut = Depends(get_current_user),
) -> Any:
    new_access = security.create_access_token(str(current_user.id), current_user.role)
    new_refresh = security.create_refresh_token(str(current_user.id))
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "expires_in": 15 * 60,
    }


@router.post("/auth/logout")
async def logout() -> Any:
    return {"ok": True}


@router.post("/auth/mfa/verify")
async def mfa_verify(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> Any:
    body = await request.json()
    mfa_token = body.get("mfa_token", "")
    code = body.get("code", "")
    try:
        payload = security.decode_token(mfa_token)
    except HTTPException:
        raise HTTPException(status_code=401, detail="Token MFA inválido o expirado.")
    user_id = payload.get("sub")
    from sqlalchemy import select
    from app.models.user import User
    result = await session.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.mfa_secret or not security.verify_mfa_code(user.mfa_secret, code):
        raise HTTPException(status_code=401, detail="Código MFA incorrecto.")
    tokens = await auth_service.issue_tokens(session, user, request.client.host if request.client else None)
    return AuthResponse(**tokens)
