"""Portal de empresa (IPS/clínica): resumen, pacientes, agenda, equipo y reportes."""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.models.appointment import Appointment
from app.models.audit import AuditLog
from app.models.medical import VitalSign
from app.models.medication import Medication, MedicationLog
from app.models.organization import Organization, OrganizationMember, OrganizationPatient
from app.models.user import MedicalProfile, User
from app.schemas import (
    OrgAppointmentOut,
    OrgAuditOut,
    OrgKpiPoint,
    OrgMemberOut,
    OrgOut,
    OrgPatientOut,
    OrgReportOut,
    OrgSummaryOut,
)

router = APIRouter()

WEEK_LABELS = ["Hace 5 sem", "Hace 4 sem", "Hace 3 sem", "Hace 2 sem", "Semana pasada", "Esta semana"]


async def _org_context(session: AsyncSession, user: User) -> tuple[Organization, OrganizationMember]:
    """Organización y membresía del usuario actual (403 si no pertenece)."""
    result = await session.execute(
        select(OrganizationMember).where(
            OrganizationMember.user_id == user.id, OrganizationMember.is_active.is_(True)
        )
    )
    member = result.scalars().first()
    if not member:
        raise HTTPException(status_code=403, detail="Tu cuenta no pertenece a ninguna organización.")
    org = await session.get(Organization, member.org_id)
    if not org or not org.is_active:
        raise HTTPException(status_code=403, detail="Organización inactiva.")
    return org, member


def _org_out(org: Organization) -> OrgOut:
    return OrgOut(
        id=org.id,
        name=org.name,
        slug=org.slug,
        plan=org.plan,
        seats=org.seats,
        city=org.city,
        country=org.country,
        sector=org.sector,
        primary_color=org.primary_color,
        tax_id=org.tax_id,
        is_active=org.is_active,
    )


async def _patients(session: AsyncSession, org_id) -> list[OrganizationPatient]:
    result = await session.execute(
        select(OrganizationPatient).where(OrganizationPatient.org_id == org_id)
    )
    return list(result.scalars().all())


async def _users_by_id(session: AsyncSession, ids: list) -> dict:
    if not ids:
        return {}
    result = await session.execute(select(User).where(User.id.in_(ids)))
    return {u.id: u for u in result.scalars().all()}


async def _adherence_by_user(session: AsyncSession, user_ids: list) -> dict:
    """Adherencia de los últimos 30 días por paciente (tomas registradas)."""
    if not user_ids:
        return {}
    result = await session.execute(
        select(MedicationLog.status, Medication.user_id)
        .join(Medication, MedicationLog.medication_id == Medication.id)
        .where(
            Medication.user_id.in_(user_ids),
            MedicationLog.taken_at >= datetime.now(timezone.utc) - timedelta(days=30),
        )
    )
    counters: dict[Any, Counter] = defaultdict(Counter)
    for status, user_id in result.all():
        counters[user_id][status or "taken"] += 1
    rates: dict[Any, float] = {}
    for uid, c in counters.items():
        total = sum(c.values())
        rates[uid] = round((c["taken"] / total) * 100, 1) if total else 0.0
    return rates


async def _latest_vitals(session: AsyncSession, user_ids: list) -> dict:
    if not user_ids:
        return {}
    result = await session.execute(
        select(VitalSign)
        .where(VitalSign.user_id.in_(user_ids))
        .order_by(VitalSign.recorded_at.desc())
    )
    latest: dict[Any, VitalSign] = {}
    for v in result.scalars().all():
        latest.setdefault(v.user_id, v)
    return latest


async def _appointments(session: AsyncSession, user_ids: list) -> list[Appointment]:
    if not user_ids:
        return []
    result = await session.execute(
        select(Appointment)
        .where(Appointment.user_id.in_(user_ids))
        .order_by(Appointment.date, Appointment.time)
    )
    return list(result.scalars().all())


@router.get("/org/me", response_model=OrgOut)
async def org_me(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    org, _ = await _org_context(session, current_user)
    return _org_out(org)


@router.get("/org/summary", response_model=OrgSummaryOut)
async def org_summary(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    org, _ = await _org_context(session, current_user)
    links = await _patients(session, org.id)
    patient_ids = [l.patient_id for l in links]

    members = (
        await session.execute(
            select(OrganizationMember).where(
                OrganizationMember.org_id == org.id, OrganizationMember.is_active.is_(True)
            )
        )
    ).scalars().all()
    professionals = [m for m in members if m.role == "professional"]

    appts = await _appointments(session, patient_ids)
    today = date.today()
    week_end = today + timedelta(days=7)
    week_appts = [a for a in appts if today <= a.date <= week_end]

    adherence = await _adherence_by_user(session, patient_ids)
    avg_adherence = round(sum(adherence.values()) / len(adherence), 1) if adherence else 0.0

    vitals = await _latest_vitals(session, patient_ids)
    recent_cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    active_7d = sum(1 for v in vitals.values() if v.recorded_at and v.recorded_at >= recent_cutoff.replace(tzinfo=None))

    risk = Counter(l.risk_level for l in links)
    risk_distribution = [
        OrgKpiPoint(label="Bajo", value=risk.get("low", 0)),
        OrgKpiPoint(label="Medio", value=risk.get("medium", 0)),
        OrgKpiPoint(label="Alto", value=risk.get("high", 0)),
    ]

    # Serie de adherencia por semana (últimas 6).
    adherence_series = await _weekly_series(session, patient_ids, kind="adherence")
    consultations_series = _consultation_series(appts)

    return OrgSummaryOut(
        organization=_org_out(org),
        patients_total=len(links),
        professionals_total=len(professionals),
        appointments_week=len(week_appts),
        adherence_rate=avg_adherence,
        high_risk=risk.get("high", 0),
        alerts=risk.get("high", 0) + sum(1 for r in adherence.values() if r and r < 50),
        active_patients_7d=active_7d,
        risk_distribution=risk_distribution,
        adherence_series=adherence_series,
        consultations_series=consultations_series,
    )


async def _weekly_series(session: AsyncSession, user_ids: list, kind: str = "adherence") -> list[OrgKpiPoint]:
    if not user_ids:
        return [OrgKpiPoint(label=lbl, value=0) for lbl in WEEK_LABELS]
    result = await session.execute(
        select(MedicationLog.status, MedicationLog.taken_at)
        .join(Medication, MedicationLog.medication_id == Medication.id)
        .where(Medication.user_id.in_(user_ids))
    )
    buckets: dict[int, Counter] = defaultdict(Counter)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for status, taken_at in result.all():
        if not taken_at:
            continue
        weeks_ago = int((now - taken_at.replace(tzinfo=None)).days // 7)
        if 0 <= weeks_ago < 6:
            buckets[weeks_ago][status or "taken"] += 1
    series: list[OrgKpiPoint] = []
    for idx in range(5, -1, -1):
        c = buckets.get(idx, Counter())
        total = sum(c.values())
        value = round((c["taken"] / total) * 100, 1) if total else 0.0
        series.append(OrgKpiPoint(label=WEEK_LABELS[5 - idx], value=value))
    return series


def _consultation_series(appts: list[Appointment]) -> list[OrgKpiPoint]:
    today = date.today()
    counts: Counter = Counter()
    for a in appts:
        weeks_ago = int((today - a.date).days // 7)
        if -1 <= weeks_ago < 6:
            counts[weeks_ago] += 1
    return [
        OrgKpiPoint(label=WEEK_LABELS[5 - i], value=float(counts.get(i, 0)))
        for i in range(5, -1, -1)
    ]


@router.get("/org/patients", response_model=list[OrgPatientOut])
async def org_patients(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    risk: str | None = Query(None, description="low | medium | high"),
    search: str | None = Query(None),
) -> Any:
    org, _ = await _org_context(session, current_user)
    links = await _patients(session, org.id)
    if risk:
        links = [l for l in links if l.risk_level == risk]

    users = await _users_by_id(
        session, list({l.patient_id for l in links} | {l.professional_id for l in links if l.professional_id})
    )
    vitals = await _latest_vitals(session, [l.patient_id for l in links])
    adherence = await _adherence_by_user(session, [l.patient_id for l in links])
    appts = await _appointments(session, [l.patient_id for l in links])

    meds = (
        await session.execute(
            select(Medication.user_id).where(
                Medication.user_id.in_([l.patient_id for l in links]), Medication.is_active.is_(True)
            )
        )
    ).all()
    meds_by_user = Counter(row[0] for row in meds)

    next_appt: dict[Any, Appointment] = {}
    for a in appts:
        if a.date >= date.today():
            next_appt.setdefault(a.user_id, a)

    out: list[OrgPatientOut] = []
    for link in links:
        u = users.get(link.patient_id)
        if not u:
            continue
        if search and search.lower() not in (u.full_name or "").lower() and search.lower() not in (u.email or "").lower():
            continue
        v = vitals.get(link.patient_id)
        nxt = next_appt.get(link.patient_id)
        prof = users.get(link.professional_id) if link.professional_id else None
        out.append(
            OrgPatientOut(
                id=u.id,
                full_name=u.full_name,
                email=u.email,
                risk_level=link.risk_level,
                cohort=link.cohort,
                professional_name=prof.full_name if prof else None,
                last_vital_at=v.recorded_at if v else None,
                last_systolic=v.systolic_bp if v else None,
                last_diastolic=v.diastolic_bp if v else None,
                last_heart_rate=v.heart_rate if v else None,
                adherence_rate=adherence.get(u.id, 0.0),
                medications_active=meds_by_user.get(u.id, 0),
                next_appointment=(
                    datetime.combine(nxt.date, nxt.time) if nxt else None
                ),
            )
        )
    out.sort(key=lambda p: ({"high": 0, "medium": 1, "low": 2}.get(p.risk_level, 3), p.full_name))
    return out


@router.get("/org/appointments", response_model=list[OrgAppointmentOut])
async def org_appointments(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    days: int = Query(14, ge=1, le=90),
) -> Any:
    org, _ = await _org_context(session, current_user)
    links = await _patients(session, org.id)
    patient_ids = [l.patient_id for l in links]
    appts = await _appointments(session, patient_ids)

    today = date.today()
    limit = today + timedelta(days=days)
    appts = [a for a in appts if today - timedelta(days=1) <= a.date <= limit]

    users = await _users_by_id(session, patient_ids)
    prof_by_patient = {
        l.patient_id: l.professional_id for l in links if l.professional_id
    }
    profs = await _users_by_id(session, list(set(prof_by_patient.values())))

    out: list[OrgAppointmentOut] = []
    for a in appts:
        patient = users.get(a.user_id)
        prof = profs.get(prof_by_patient.get(a.user_id))
        out.append(
            OrgAppointmentOut(
                id=a.id,
                patient_name=patient.full_name if patient else "Paciente",
                professional_name=prof.full_name if prof else a.doctor_name,
                specialty=a.specialty,
                date=a.date,
                time=a.time,
                modality=a.modality,
                status=a.status,
            )
        )
    return out


@router.get("/org/professionals", response_model=list[OrgMemberOut])
async def org_professionals(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    org, _ = await _org_context(session, current_user)
    members = (
        await session.execute(
            select(OrganizationMember).where(OrganizationMember.org_id == org.id)
        )
    ).scalars().all()
    users = await _users_by_id(session, [m.user_id for m in members])

    links = await _patients(session, org.id)
    per_prof = Counter(l.professional_id for l in links if l.professional_id)

    appts = await _appointments(session, [l.patient_id for l in links])
    today = date.today()
    week = [a for a in appts if today <= a.date <= today + timedelta(days=7)]
    appts_per_prof = Counter(
        {l.patient_id: l.professional_id for l in links if l.professional_id}.get(a.user_id) for a in week
    )

    out: list[OrgMemberOut] = []
    for m in members:
        u = users.get(m.user_id)
        if not u:
            continue
        out.append(
            OrgMemberOut(
                id=m.id,
                user_id=u.id,
                full_name=u.full_name,
                email=u.email,
                role=m.role,
                specialty=m.specialty,
                license_number=m.license_number,
                phone=m.phone,
                is_active=m.is_active,
                patients_count=per_prof.get(u.id, 0),
                appointments_week=appts_per_prof.get(u.id, 0),
            )
        )
    out.sort(key=lambda m: (m.role != "admin", m.full_name))
    return out


@router.get("/org/audit", response_model=list[OrgAuditOut])
async def org_audit(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    limit: int = Query(25, ge=1, le=100),
) -> Any:
    org, _ = await _org_context(session, current_user)
    links = await _patients(session, org.id)
    patient_ids = [l.patient_id for l in links]

    result = await session.execute(
        select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    )
    logs = list(result.scalars().all())
    actors = await _users_by_id(session, [log.actor_id for log in logs if log.actor_id])

    out: list[OrgAuditOut] = []
    for log in logs:
        if log.actor_id and log.actor_id not in patient_ids:
            # Solo eventos de pacientes o del equipo de la organización.
            continue
        actor = actors.get(log.actor_id) if log.actor_id else None
        out.append(
            OrgAuditOut(
                id=log.id,
                action=log.action,
                resource_type=log.resource_type,
                resource_id=log.resource_id,
                timestamp=log.timestamp,
                actor_name=actor.full_name if actor else None,
            )
        )
    return out


@router.get("/org/reports", response_model=OrgReportOut)
async def org_reports(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    org, _ = await _org_context(session, current_user)
    links = await _patients(session, org.id)
    patient_ids = [l.patient_id for l in links]

    users = await _users_by_id(session, [l.professional_id for l in links if l.professional_id])
    adherence = await _adherence_by_user(session, patient_ids)

    by_prof: dict[Any, list[float]] = defaultdict(list)
    for link in links:
        by_prof[link.professional_id].append(adherence.get(link.patient_id, 0.0))

    adherence_by_professional = [
        OrgKpiPoint(
            label=(users.get(pid).full_name if pid and users.get(pid) else "Sin asignar"),
            value=round(sum(vals) / len(vals), 1) if vals else 0.0,
        )
        for pid, vals in by_prof.items()
    ]

    cohort_counts = Counter(l.cohort or "General" for l in links)
    patients_by_cohort = [OrgKpiPoint(label=k, value=float(v)) for k, v in cohort_counts.items()]

    profiles = (
        await session.execute(select(MedicalProfile).where(MedicalProfile.user_id.in_(patient_ids)))
    ).scalars().all()
    conditions: Counter = Counter()
    for p in profiles:
        for c in p.chronic_conditions or []:
            conditions[c] += 1
    top_conditions = [OrgKpiPoint(label=k, value=float(v)) for k, v in conditions.most_common(5)]

    vitals = (
        await session.execute(
            select(VitalSign).where(VitalSign.user_id.in_(patient_ids))
            .order_by(VitalSign.recorded_at.desc()).limit(200)
        )
    ).scalars().all()
    systolic = [v.systolic_bp for v in vitals if v.systolic_bp]
    glucose = [v.glucose for v in vitals if v.glucose]

    return OrgReportOut(
        adherence_by_professional=adherence_by_professional,
        patients_by_cohort=patients_by_cohort,
        top_conditions=top_conditions,
        avg_adherence=round(sum(adherence.values()) / len(adherence), 1) if adherence else 0.0,
        avg_systolic=round(sum(systolic) / len(systolic), 1) if systolic else 0.0,
        avg_glucose=round(sum(glucose) / len(glucose), 1) if glucose else 0.0,
    )
