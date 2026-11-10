"""Auth service."""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core import security
from app.core.audit import record as audit_record
from app.models.user import User


async def authenticate_user(session: AsyncSession, email: str, password: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not security.verify_password(password, user.hashed_password):
        return None
    return user


async def create_user(
    session: AsyncSession,
    *,
    email: str,
    password: str,
    full_name: str,
    date_of_birth: str,
) -> User:
    existing = await session.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise ValueError("email_duplicate")

    user = User(
        email=email,
        hashed_password=security.hash_password(password),
        full_name=full_name,
        date_of_birth=date_of_birth,
        role="patient",
    )
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user


async def issue_tokens(session: AsyncSession, user: User, ip_address: str | None) -> dict[str, Any]:
    await audit_record(
        session,
        actor_id=str(user.id),
        action="login",
        resource_type="user",
        resource_id=str(user.id),
        details={"email": user.email},
        ip_address=ip_address,
    )
    return {
        "access_token": security.create_access_token(str(user.id), user.role),
        "refresh_token": security.create_refresh_token(str(user.id)),
        "token_type": "bearer",
        "expires_in": 15 * 60,
        "user": user,
        "mfa_required": user.mfa_enabled,
    }
