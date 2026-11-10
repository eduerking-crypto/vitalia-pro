"""Medication service: CRUD, adherence, taken logging."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.audit import record as audit_record
from app.models.medication import Medication, MedicationLog
from app.schemas.medication import MedicationCreate, MedicationUpdate


async def list_medications(session: AsyncSession, user_id: str) -> list[Medication]:
    result = await session.execute(
        select(Medication).where(Medication.user_id == user_id).order_by(Medication.time)
    )
    return result.scalars().all()


async def get_medication(session: AsyncSession, medication_id: str, user_id: str) -> Medication | None:
    result = await session.execute(
        select(Medication).where(Medication.id == medication_id, Medication.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def create_medication(session: AsyncSession, user_id: str, data: MedicationCreate) -> Medication:
    medication = Medication(user_id=user_id, **data.model_dump())
    session.add(medication)
    await session.flush()
    await session.refresh(medication)
    return medication


async def update_medication(
    session: AsyncSession, medication: Medication, data: MedicationUpdate
) -> Medication:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(medication, field, value)
    await session.flush()
    await session.refresh(medication)
    return medication


async def delete_medication(session: AsyncSession, medication: Medication) -> None:
    await session.delete(medication)


async def mark_taken(
    session: AsyncSession, medication: Medication, status: str = "taken"
) -> MedicationLog:
    log = MedicationLog(medication_id=medication.id, taken_at=datetime.utcnow(), status=status)
    session.add(log)
    await session.flush()
    await audit_record(
        session,
        actor_id=str(medication.user_id),
        action="medication_taken",
        resource_type="medication",
        resource_id=str(medication.id),
        details={"status": status, "medication": medication.name},
    )
    return log


async def check_interactions(session: AsyncSession, user_id: str) -> dict[str, Any]:
    from app.services.interaction_checker import check

    medications = await list_medications(session, user_id)
    names = [m.name for m in medications if m.is_active]
    interactions = check(names)
    await audit_record(
        session,
        actor_id=user_id,
        action="interaction_check",
        resource_type="medication",
        resource_id=user_id,
        details={"count": len(interactions)},
    )
    return {"interactions": interactions, "checked_at": datetime.utcnow().isoformat()}


async def adherence_stats(
    session: AsyncSession, user_id: str, days: int = 30
) -> dict[str, Any]:
    from datetime import timedelta

    since = date.today() - timedelta(days=days)
    result = await session.execute(
        select(MedicationLog)
        .join(Medication, MedicationLog.medication_id == Medication.id)
        .where(Medication.user_id == user_id, MedicationLog.taken_at >= since)
    )
    logs = result.scalars().all()

    expected = 0
    taken = skipped = late = 0
    per_med: dict[str, dict[str, Any]] = {}
    for log in logs:
        expected += 1
        if log.status == "taken":
            taken += 1
        elif log.status == "skipped":
            skipped += 1
        else:
            late += 1
        med = await session.get(Medication, log.medication_id)
        entry = per_med.setdefault(str(med.id), {"name": med.name, "taken": 0, "expected": 0})
        entry["expected"] += 1
        if log.status == "taken":
            entry["taken"] += 1

    rate = round((taken / expected) * 100, 1) if expected else 0.0
    by_medication = [
        {
            "medication_id": mid,
            "name": v["name"],
            "adherence_rate": round((v["taken"] / v["expected"]) * 100, 1) if v["expected"] else 0.0,
        }
        for mid, v in per_med.items()
    ]
    return {
        "period_days": days,
        "expected_doses": expected,
        "taken_doses": taken,
        "skipped_doses": skipped,
        "late_doses": late,
        "adherence_rate": rate,
        "by_medication": by_medication,
    }
