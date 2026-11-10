"""User / profile endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api.deps import get_session, get_current_user, require_role
from app.core.audit import record as audit_record
from app.services import auth_service
from app.models.user import User, MedicalProfile
from app.schemas import (
    UserOut, UserUpdate, MedicalProfileOut, MedicalProfileUpdate,
    AllergyOut, AllergyCreate,
)

router = APIRouter()


@router.get("/users/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user


@router.put("/users/me", response_model=UserOut)
async def update_me(
    request: Request,
    data: UserUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    await session.flush()
    await session.refresh(current_user)
    await audit_record(
        session,
        actor_id=str(current_user.id),
        action="profile_updated",
        resource_type="user",
        resource_id=str(current_user.id),
        ip_address=request.client.host if request.client else None,
    )
    return current_user


@router.get("/users/me/medical", response_model=MedicalProfileOut)
async def get_medical(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    if not current_user.medical_profile:
        raise HTTPException(status_code=404, detail="Perfil médico no encontrado.")
    return current_user.medical_profile


@router.put("/users/me/medical", response_model=MedicalProfileOut)
async def update_medical(
    request: Request,
    data: MedicalProfileUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    if not current_user.medical_profile:
        raise HTTPException(status_code=404, detail="Perfil médico no encontrado.")
    profile = current_user.medical_profile
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await session.flush()
    await session.refresh(profile)
    await audit_record(
        session,
        actor_id=str(current_user.id),
        action="medical_profile_updated",
        resource_type="medical_profile",
        resource_id=str(profile.id),
        ip_address=request.client.host if request.client else None,
    )
    return profile


@router.post("/users/me/allergies", response_model=AllergyOut, status_code=status.HTTP_201_CREATED)
async def add_allergy(
    request: Request,
    data: AllergyCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    if not current_user.medical_profile:
        raise HTTPException(status_code=404, detail="Perfil médico no encontrado.")
    from app.models.user import Allergy
    allergy = Allergy(profile_id=current_user.medical_profile.id, **data.model_dump())
    session.add(allergy)
    await session.flush()
    await session.refresh(allergy)
    await audit_record(
        session,
        actor_id=str(current_user.id),
        action="allergy_added",
        resource_type="allergy",
        resource_id=str(allergy.id),
        ip_address=request.client.host if request.client else None,
    )
    return allergy


@router.delete("/users/me/allergies/{allergy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_allergy(
    request: Request,
    allergy_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    from app.models.user import Allergy
    from uuid import UUID
    result = await session.execute(
        select(Allergy).where(Allergy.id == UUID(allergy_id), Allergy.profile_id == current_user.medical_profile.id)
    )
    allergy = result.scalar_one_or_none()
    if not allergy:
        raise HTTPException(status_code=404, detail="Alergia no encontrada.")
    await session.delete(allergy)
    await audit_record(
        session,
        actor_id=str(current_user.id),
        action="allergy_removed",
        resource_type="allergy",
        resource_id=allergy_id,
        ip_address=request.client.host if request.client else None,
    )
