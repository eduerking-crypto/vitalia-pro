"""Audit log with hash chaining for PHI access (HIPAA traceability)."""

from __future__ import annotations

import hashlib
import json
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog


async def record(
    session: AsyncSession,
    *,
    actor_id: str | None,
    action: str,
    resource_type: str,
    resource_id: str,
    details: dict[str, Any] | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    """Append an audit record whose hash is chained to the previous one."""
    result = await session.execute(
        AuditLog.__table__.select().order_by(AuditLog.id.desc()).limit(1)
    )
    previous = result.scalar_one_or_none()
    previous_hash = previous.hash if previous else ""

    payload = {
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details or {},
        "actor_id": actor_id,
        "ip_address": ip_address,
    }
    chain_input = f"{previous_hash}|{json.dumps(payload, sort_keys=True)}"
    record_hash = hashlib.sha256(chain_input.encode("utf-8")).hexdigest()

    entry = AuditLog(
        actor_id=actor_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
        ip_address=ip_address,
        previous_hash=previous_hash,
        hash=record_hash,
    )
    session.add(entry)
    await session.flush()
    return entry
