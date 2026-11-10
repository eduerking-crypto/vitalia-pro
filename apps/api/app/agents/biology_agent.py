"""Agent placeholders (biology, nutrition, security) - logic lives in agents/router.py."""

from __future__ import annotations

from typing import Any

from app.agents.router import run_assistant


async def biology_agent(message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    return await run_assistant(message, context.get("user_id", "") if context else "", context)


async def nutrition_agent(message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    return await run_assistant(message, context.get("user_id", "") if context else "", context)


async def security_agent(message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    return await run_assistant(message, context.get("user_id", "") if context else "", context)
