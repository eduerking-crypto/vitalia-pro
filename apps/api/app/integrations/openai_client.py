"""OpenAI client with graceful degradation (works without an API key)."""

from __future__ import annotations

import os

from app.core.config import settings


async def chat_completion(system: str, user: str) -> str | None:
    """Call OpenAI ChatCompletions. Returns None if no key or on failure."""
    if not settings.openai_api_key:
        return None
    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            temperature=0.3,
            max_tokens=400,
        )
        return (response.choices[0].message.content or "").strip()
    except Exception:
        return None


async def fhir_patient_summary(patient_id: str) -> dict[str, object] | None:
    """Stub FHIR R4 client — ready to be wired to a real FHIR server."""
    return {
        "resourceType": "Patient",
        "id": patient_id,
        "note": "FHIR integration stub — configure fhir_base_url to connect.",
    }
