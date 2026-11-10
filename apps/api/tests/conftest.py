"""Tests for VITALIA PRO API (SQLite in-memory, no Docker required)."""

from __future__ import annotations

import asyncio
import uuid
from datetime import date, datetime, time, timedelta

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.database import Base, async_session_factory as _orig_factory, engine as _orig_engine
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def _setup_db():
    engine_test = create_async_engine(TEST_DATABASE_URL)
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine_test.dispose()


@pytest.fixture
async def session() -> AsyncSession:
    engine_test = create_async_engine(TEST_DATABASE_URL)
    session_factory = async_sessionmaker(engine_test, expire_on_commit=False)
    async with session_factory() as s:
        yield s
    await engine_test.dispose()


@pytest.fixture
async def client(session: AsyncSession):
    # Override dependency to use the test session
    async def _get_session():
        yield session

    app.dependency_overrides[__import__("app.core.database", fromlist=["async_session_factory"]).async_session_factory] = lambda: session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
async def demo_user(client: AsyncClient, session: AsyncSession):
    from app.models.user import User
    from app.core import security
    user = User(
        id=uuid.uuid4(),
        email="demo@vitalia.health",
        hashed_password=security.hash_password("Demo1234!"),
        full_name="Demo User",
        date_of_birth=date(1990, 1, 1),
        biological_sex="female",
        role="patient",
        is_active=True,
    )
    session.add(user)
    await session.commit()
    return user


@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    r = await client.post("/api/v1/auth/register", json={
        "email": "newuser@vitalia.health",
        "password": "Str0ngPass!",
        "full_name": "Usuario Nuevo",
        "date_of_birth": "1990-01-01",
    })
    assert r.status_code == 201, r.text
    data = r.json()
    assert "access_token" in data

    r = await client.post("/api/v1/auth/login", json={
        "email": "newuser@vitalia.health",
        "password": "Str0ngPass!",
    })
    assert r.status_code == 200, r.text
    assert r.json()["access_token"]


@pytest.mark.asyncio
async def test_medication_crud(client: AsyncClient, demo_user):
    # login
    r = await client.post("/api/v1/auth/login", json={"email": "demo@vitalia.health", "password": "Demo1234!"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = await client.post("/api/v1/medications", json={
        "name": "Metformina", "active_ingredient": "metformina HCl", "dosage": "850 mg",
        "frequency": "twice_daily", "time": "08:00", "instructions": "con comida",
        "start_date": str(date.today()), "remaining_quantity": 30, "prescribed_by": "Dr. X",
    }, headers=headers)
    assert r.status_code == 201, r.text
    med = r.json()
    med_id = med["id"]

    r = await client.get("/api/v1/medications", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) >= 1

    r = await client.patch(f"/api/v1/medications/{med_id}/taken", params={"status": "taken"}, headers=headers)
    assert r.status_code == 200, r.text

    r = await client.get("/api/v1/medications/interactions", headers=headers)
    assert r.status_code == 200

    r = await client.get("/api/v1/medications/adherence", headers=headers)
    assert r.status_code == 200

    r = await client.delete(f"/api/v1/medications/{med_id}", headers=headers)
    assert r.status_code == 204, r.text


@pytest.mark.asyncio
async def test_nutrition(client: AsyncClient, demo_user):
    r = await client.post("/api/v1/auth/login", json={"email": "demo@vitalia.health", "password": "Demo1234!"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = await client.post("/api/v1/meals", json={
        "date": str(date.today()), "meal_type": "breakfast", "food_name": "Avena",
        "calories": 340, "protein_g": 10, "carbs_g": 50, "fat_g": 8, "fiber_g": 7,
    }, headers=headers)
    assert r.status_code == 201, r.text

    r = await client.get(f"/api/v1/nutrition/daily-summary?date={date.today()}", headers=headers)
    assert r.status_code == 200, r.text
    assert r.json()["total_calories"] == 340

    meal_id = r if False else None
    r = await client.get("/api/v1/nutrition/suggestions", headers=headers)
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_health_vitals_and_score(client: AsyncClient, demo_user):
    r = await client.post("/api/v1/auth/login", json={"email": "demo@vitalia.health", "password": "Demo1234!"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = await client.post("/api/v1/health/vitals", json={
        "recorded_at": datetime.utcnow().isoformat(),
        "systolic_bp": 120, "diastolic_bp": 80, "heart_rate": 65,
    }, headers=headers)
    assert r.status_code == 201, r.text

    r = await client.get("/api/v1/health/vitals", headers=headers)
    assert r.status_code == 200

    r = await client.get("/api/v1/health/score", headers=headers)
    assert r.status_code == 200
    assert "score" in r.json()


@pytest.mark.asyncio
async def test_assistant(client: AsyncClient, demo_user):
    r = await client.post("/api/v1/auth/login", json={"email": "demo@vitalia.health", "password": "Demo1234!"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = await client.post("/api/v1/assistant/chat", json={"message": "¿cómo ha sido mi sueño?"}, headers=headers)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "message" in body and "agent_used" in body
