"""Seed data for VITALIA PRO (idempotent demo data).

Run with:  python -m app.seed
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.core import security
from app.models.user import User, MedicalProfile, Allergy
from app.models.medication import Medication, MedicationLog
from app.models.meal import Meal
from app.models.appointment import Appointment
from app.models.medical import VitalSign, SleepRecord, MoodRecord, LabResult, Document
from app.models.organization import Organization, OrganizationMember, OrganizationPatient

DEMO_EMAIL = "demo@vitalia.health"
DEMO_PASSWORD = "Demo1234!"

ORG_SLUG = "clinica-vitalia"
ORG_ADMIN_EMAIL = "admin@vitalia.ips"
ORG_PASSWORD = "Ips1234!"

ORG_USERS = [
    # (email, nombre, rol de membresía, especialidad, licencia)
    ("admin@vitalia.ips", "Laura Mendoza", "admin", "Dirección médica", "ADM-2026-001"),
    ("dr.ortiz@vitalia.ips", "Dr. Javier Ortiz", "professional", "Cardiología", "MED-88421"),
    ("dra.solis@vitalia.ips", "Dra. Carmen Solís", "professional", "Medicina interna", "MED-77310"),
]

ORG_PATIENTS = [
    # (email, nombre, riesgo, cohorte, profesional asignado, edad)
    ("ana.gomez@vitalia.health", "Ana Gómez", "high", "Cardiometabólico", "dr.ortiz@vitalia.ips", 1981),
    ("carlos.ruiz@vitalia.health", "Carlos Ruiz", "medium", "Hipertensión", "dra.solis@vitalia.ips", 1972),
    ("lucia.torres@vitalia.health", "Lucía Torres", "low", "Prevención", "dra.solis@vitalia.ips", 1994),
    ("miguel.herrera@vitalia.health", "Miguel Herrera", "medium", "Diabetes", "dr.ortiz@vitalia.ips", 1965),
]


async def _create_patient(
    session: AsyncSession,
    *,
    email: str,
    full_name: str,
    birth_year: int,
    conditions: list[str],
    meds: list[tuple[str, str, str, str]],
    adherence: float,
) -> User:
    user = User(
        id=uuid.uuid4(),
        email=email,
        hashed_password=security.hash_password(DEMO_PASSWORD),
        full_name=full_name,
        date_of_birth=date(birth_year, 5, 20),
        biological_sex="female" if full_name.endswith("a") or full_name.endswith("z") else "male",
        role="patient",
        is_active=True,
        mfa_enabled=False,
    )
    session.add(user)
    await session.flush()

    profile = MedicalProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        blood_type="O+",
        height_cm=168,
        weight_kg=70,
        chronic_conditions=conditions,
        family_history=["Padre: hipertensión"],
        emergency_contact_name="Familiar de contacto",
        emergency_contact_phone_enc="+57 300 000 0000",
        insurance_provider="Sanitas",
        insurance_policy="POL-0001",
    )
    session.add(profile)

    created_meds: list[Medication] = []
    for name, ingredient, dosage, freq in meds:
        med = Medication(
            id=uuid.uuid4(),
            user_id=user.id,
            name=name,
            active_ingredient=ingredient,
            dosage=dosage,
            frequency=freq,
            time=time(8, 0),
            instructions="Tomar con alimentos.",
            start_date=date.today() - timedelta(days=90),
            is_active=True,
            reminder_enabled=True,
            remaining_quantity=60,
            rxnorm_code="",
            prescribed_by="Equipo Vitalia IPS",
        )
        session.add(med)
        created_meds.append(med)
    await session.flush()

    # Historial de tomas para que la adherencia sea realista.
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    total = 28
    taken = int(total * adherence)
    for i in range(total):
        med = created_meds[i % len(created_meds)] if created_meds else None
        if not med:
            break
        session.add(
            MedicationLog(
                id=uuid.uuid4(),
                medication_id=med.id,
                taken_at=now - timedelta(days=i),
                status="taken" if i < taken else "skipped",
            )
        )

    for i in range(10):
        d = date.today() - timedelta(days=9 - i)
        session.add(
            VitalSign(
                id=uuid.uuid4(),
                user_id=user.id,
                recorded_at=datetime(d.year, d.month, d.day, 8, 0),
                systolic_bp=138 if adherence < 0.6 else 122,
                diastolic_bp=88 if adherence < 0.6 else 78,
                heart_rate=76,
                temperature=36.6,
                oxygen_saturation=97,
                glucose=112,
                weight_kg=70,
            )
        )
        session.add(
            SleepRecord(
                id=uuid.uuid4(),
                user_id=user.id,
                date=d,
                duration_minutes=400,
                deep_sleep_minutes=75,
                rem_sleep_minutes=85,
                light_sleep_minutes=200,
                awake_minutes=40,
                efficiency=83,
                notes="",
            )
        )
        session.add(MoodRecord(id=uuid.uuid4(), user_id=user.id, date=d, mood=4, emoji="🙂", notes=""))

    session.add(
        Appointment(
            id=uuid.uuid4(),
            user_id=user.id,
            doctor_name="Equipo Vitalia IPS",
            specialty="Medicina interna",
            date=date.today() + timedelta(days=3),
            time=time(9, 30),
            modality="video",
            status="confirmed",
            reason="Control de seguimiento",
            notes="",
        )
    )
    await session.flush()
    return user


async def seed_organization(session: AsyncSession) -> None:
    existing = await session.execute(select(Organization).where(Organization.slug == ORG_SLUG))
    if existing.scalar_one_or_none():
        print("Organización ya existe. Skipping org seed.")
        return

    org = Organization(
        id=uuid.uuid4(),
        name="Clínica Vitalia IPS",
        slug=ORG_SLUG,
        tax_id="NIT-901.555.221-4",
        city="Bogotá",
        country="Colombia",
        sector="IPS",
        plan="enterprise",
        seats=250,
        primary_color="#4E7B84",
        is_active=True,
    )
    session.add(org)
    await session.flush()

    staff: dict[str, User] = {}
    for email, name, role, specialty, license_number in ORG_USERS:
        user = User(
            id=uuid.uuid4(),
            email=email,
            hashed_password=security.hash_password(ORG_PASSWORD),
            full_name=name,
            date_of_birth=date(1980, 3, 12),
            biological_sex="female" if name.startswith("Dra") or name.startswith("Laura") else "male",
            role="admin" if role == "admin" else "doctor",
            is_active=True,
            mfa_enabled=False,
        )
        session.add(user)
        await session.flush()
        staff[email] = user
        session.add(
            OrganizationMember(
                id=uuid.uuid4(),
                org_id=org.id,
                user_id=user.id,
                role=role,
                specialty=specialty,
                license_number=license_number,
                phone="+57 601 555 0000",
                is_active=True,
            )
        )

    # El usuario demo principal también es paciente de la IPS.
    demo = (await session.execute(select(User).where(User.email == DEMO_EMAIL))).scalar_one_or_none()
    if demo:
        session.add(
            OrganizationPatient(
                id=uuid.uuid4(),
                org_id=org.id,
                patient_id=demo.id,
                professional_id=staff["dr.ortiz@vitalia.ips"].id,
                risk_level="medium",
                cohort="Cardiometabólico",
            )
        )

    for email, name, risk, cohort, professional_email, birth_year in ORG_PATIENTS:
        adherence = {"high": 0.45, "medium": 0.7, "low": 0.95}[risk]
        patient = await _create_patient(
            session,
            email=email,
            full_name=name,
            birth_year=birth_year,
            conditions=["Hipertensión arterial", "Dislipidemia"] if risk != "low" else ["Sin condiciones crónicas"],
            meds=[
                ("Losartán", "losartán potásico", "50 mg", "once_daily"),
                ("Metformina", "metformina HCl", "850 mg", "twice_daily"),
            ],
            adherence=adherence,
        )
        session.add(
            OrganizationPatient(
                id=uuid.uuid4(),
                org_id=org.id,
                patient_id=patient.id,
                professional_id=staff[professional_email].id,
                risk_level=risk,
                cohort=cohort,
            )
        )

    await session.flush()
    print("Organización creada:", org.name, "| admin:", ORG_ADMIN_EMAIL, "/", ORG_PASSWORD)


async def seed() -> None:
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.email == DEMO_EMAIL))
        if result.scalar_one_or_none():
            print("Demo user already exists. Skipping base seed.")
        else:
            await _seed_base(session)
        await seed_organization(session)
        await session.commit()


async def _seed_base(session: AsyncSession) -> None:
    user = User(
        id=uuid.uuid4(),
        email=DEMO_EMAIL,
        hashed_password=security.hash_password(DEMO_PASSWORD),
        full_name="Dra. Elena Ríos",
        date_of_birth=date(1988, 4, 12),
        biological_sex="female",
        role="patient",
        is_active=True,
        mfa_enabled=False,
    )
    session.add(user)
    await session.flush()

    profile = MedicalProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        blood_type="O+",
        height_cm=168,
        weight_kg=64.2,
        chronic_conditions=["Hipertensión arterial leve", "Prediabetes"],
        family_history=["Padre: cardiopatía isquémica", "Madre: hipotiroidismo"],
        emergency_contact_name="Marcos Ríos (hermano)",
        emergency_contact_phone_enc="+34 611 223 344",
        insurance_provider="Sanitas — Plan Vital",
        insurance_policy="SAN-8842-2019",
    )
    session.add(profile)
    await session.flush()

    for a in [
        ("Penicilina", "severe", "Urticaria generalizada y dificultad respiratoria"),
        ("Polen de gramíneas", "moderate", "Rinitis alérgica estacional"),
        ("Sulfitos", "mild", "Cefalea leve tras vino tinto"),
    ]:
        session.add(Allergy(profile_id=profile.id, allergen=a[0], severity=a[1], reaction=a[2]))

    meds_data = [
        ("Metformina", "metformina HCl", "850 mg", "twice_daily", time(8, 0), "Tomar con las comidas principales.", 42, "Dr. Javier Ortiz"),
        ("Losartán", "losartán potásico", "50 mg", "once_daily", time(9, 0), "Prefiere toma matinal con desayuno.", 28, "Dra. Carmen Solís"),
        ("Warfarina", "warfarina sódica", "5 mg", "once_daily", time(20, 0), "Evitar alimentos ricos en vitamina K sin consulta previa.", 17, "Dra. Carmen Solís"),
        ("Vitamina D3", "colecalciferol", "2000 UI", "once_daily", time(13, 0), "Tomar con una comida que contenga grasa.", 120, "Dr. Javier Ortiz"),
        ("Omeprazol", "omeprazol", "20 mg", "once_daily", time(7, 30), "En ayunas, 30 min antes del desayuno.", 33, "Dra. Ana Beltrán"),
    ]
    for m in meds_data:
        session.add(Medication(
            id=uuid.uuid4(), user_id=user.id, name=m[0], active_ingredient=m[1], dosage=m[2],
            frequency=m[3], time=m[4], instructions=m[5], start_date=date.today() - timedelta(days=60),
            end_date=None, is_active=True, reminder_enabled=True, remaining_quantity=m[6],
            rxnorm_code="", prescribed_by=m[7],
        ))

    today = date.today()
    meals = [
        (today, "breakfast", "Avena con frutos rojos y chía", 340, 14, 48, 9, 9),
        (today, "lunch", "Salmón a la plancha con quinoa y brócoli", 520, 38, 45, 22, 7),
        (today, "dinner", "Crema de calabaza y tortilla francesa", 390, 22, 28, 18, 6),
        (today - timedelta(days=1), "breakfast", "Tostadas integrales con aguacate y huevo", 420, 18, 38, 20, 8),
    ]
    for m in meals:
        session.add(Meal(
            id=uuid.uuid4(), user_id=user.id, date=m[0], meal_type=m[1], food_name=m[2],
            calories=m[3], protein_g=m[4], carbs_g=m[5], fat_g=m[6], fiber_g=m[7],
            notes="", image_url=None,
        ))

    appts = [
        ("Dra. Ana Beltrán", "Medicina Familiar", today + timedelta(days=2), time(10, 30), "video", "pending", "Revisión de tratamiento anticoagulante", "Llevar el último INR."),
        ("Dra. Carmen Solís", "Cardiología", today + timedelta(days=5), time(16, 0), "video", "confirmed", "Control de hipertensión y ECG previo", ""),
    ]
    for a in appts:
        session.add(Appointment(
            id=uuid.uuid4(), user_id=user.id, doctor_name=a[0], specialty=a[1], date=a[2], time=a[3],
            modality=a[4], status=a[5], reason=a[6], notes=a[7],
        ))

    for i in range(14):
        d = today - timedelta(days=13 - i)
        session.add(VitalSign(
            id=uuid.uuid4(), user_id=user.id,
            recorded_at=datetime(d.year, d.month, d.day, 8, 0),
            systolic_bp=118, diastolic_bp=76, heart_rate=68, temperature=36.5,
            oxygen_saturation=97, glucose=90, weight_kg=64.2,
        ))
        session.add(SleepRecord(
            id=uuid.uuid4(), user_id=user.id, date=d,
            duration_minutes=410, deep_sleep_minutes=80, rem_sleep_minutes=90,
            light_sleep_minutes=200, awake_minutes=40, efficiency=85, notes="",
        ))
        session.add(MoodRecord(
            id=uuid.uuid4(), user_id=user.id, date=d, mood=4, emoji="🙂", notes="",
        ))

    session.add(LabResult(
        id=uuid.uuid4(), user_id=user.id, test_name="Hemograma completo",
        lab_name="Laboratorio Central Vitalia", date=today - timedelta(days=21), status="normal",
        values=[{"name": "Hemoglobina", "value": 13.8, "unit": "g/dL", "reference_min": 12, "reference_max": 16, "status": "normal"}],
        file_url="#",
    ))
    session.add(Document(
        id=uuid.uuid4(), user_id=user.id, filename="informe-cardiologia-2026.pdf",
        document_type="Informe médico", file_url="#", file_size=384221,
        uploaded_at=datetime.now(timezone.utc) - timedelta(hours=1), shared_with=["Dra. Carmen Solís"],
    ))
    await session.flush()
    print("Seed base completed. Demo user:", DEMO_EMAIL, "/", DEMO_PASSWORD)


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
