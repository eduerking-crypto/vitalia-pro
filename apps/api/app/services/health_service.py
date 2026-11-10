"""Health service: vital signs, sleep, mood, score."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.medical import VitalSign as VS, SleepRecord as SR, MoodRecord as MR
from app.schemas.health import VitalSignCreate, MoodRecordCreate


async def list_vitals(session: AsyncSession, user_id: str, days: int = 30) -> list[VS]:
    since = date.today() - timedelta(days=days - 1)
    result = await session.execute(
        select(VS)
        .where(VS.user_id == user_id, VS.recorded_at >= since)
        .order_by(VS.recorded_at)
    )
    return result.scalars().all()


async def record_vitals(session: AsyncSession, user_id: str, data: VitalSignCreate, ip_address: str | None) -> VS:
    vitals = VS(user_id=user_id, **data.model_dump(exclude_none=True))
    session.add(vitals)
    await session.flush()
    await session.refresh(vitals)
    await audit_record(
        session,
        actor_id=user_id,
        action="vitals_recorded",
        resource_type="vital_sign",
        resource_id=str(vitals.id),
        details={"recorded_at": data.recorded_at},
        ip_address=ip_address,
    )
    return vitals


async def list_sleep(session: AsyncSession, user_id: str, days: int = 14) -> list[SR]:
    since = date.today() - timedelta(days=days - 1)
    result = await session.execute(
        select(SR).where(SR.user_id == user_id, SR.date >= since).order_by(SR.date)
    )
    return result.scalars().all()


async def record_sleep(session: AsyncSession, user_id: str, data: dict[str, Any]) -> SR:
    sleep = SR(user_id=user_id, **data)
    session.add(sleep)
    await session.flush()
    await session.refresh(sleep)
    return sleep


async def list_mood(session: AsyncSession, user_id: str, days: int = 14) -> list[MR]:
    since = date.today() - timedelta(days=days - 1)
    result = await session.execute(
        select(MR).where(MR.user_id == user_id, MR.date >= since).order_by(MR.date)
    )
    return result.scalars().all()


async def record_mood(session: AsyncSession, user_id: str, data: MoodRecordCreate) -> MR:
    mood = MR(user_id=user_id, **data.model_dump())
    session.add(mood)
    await session.flush()
    await session.refresh(mood)
    return mood


def compute_score(vitals: list[VS], sleep: list[SR], mood: list[MR]) -> dict[str, Any]:
    """Simple deterministic health score (0-100) used when no ML model is available."""
    score = 50
    components = [
        {"key": "cardio", "name": "Salud cardiovascular", "value": 75, "weight": 0.25},
        {"key": "sleep", "name": "Sueño", "value": 70, "weight": 0.25},
        {"key": "mood", "name": "Bienestar emocional", "value": 65, "weight": 0.2},
        {"key": "activity", "name": "Actividad física", "value": 60, "weight": 0.2},
        {"key": "nutrition", "name": "Nutrición", "value": 70, "weight": 0.1},
    ]
    if vitals:
        last = vitals[-1]
        hr = last.heart_rate or 70
        components[0]["value"] = min(100, max(0, 100 - abs(hr - 65)))
    if sleep:
        eff = sum(s.efficiency or 70 for s in sleep) / len(sleep)
        components[1]["value"] = round(eff, 1)
    if mood:
        avg = sum(m.mood for m in mood) / len(mood)
        components[2]["value"] = round((avg / 5) * 100, 1)

    total = round(sum(c["value"] * c["weight"] for c in components))
    label = "excelente" if total >= 80 else "buena" if total >= 60 else "regular" if total >= 40 else "requiere atención"
    return {"score": total, "label": label, "components": components}


async def health_score(session: AsyncSession, user_id: str) -> dict[str, Any]:
    vitals = await list_vitals(session, user_id, 7)
    sleep = await list_sleep(session, user_id, 14)
    mood = await list_mood(session, user_id, 14)
    return compute_score(vitals, sleep, mood)
