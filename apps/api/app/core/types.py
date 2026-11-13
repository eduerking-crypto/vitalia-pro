"""Tipos SQLAlchemy portables: UUID que acepta tanto `uuid.UUID` como `str`.

Permite que los endpoints puedan pasar identificadores como cadenas sin romper
en SQLite (donde el tipo UUID se almacena como CHAR(32)).
"""

from __future__ import annotations

import uuid

from sqlalchemy import Uuid
from sqlalchemy.types import TypeDecorator


class UUIDStr(TypeDecorator):
    """UUID portable que normaliza `str` a `uuid.UUID` en el bind."""

    impl = Uuid
    cache_ok = True

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("as_uuid", True)
        super().__init__(*args, **kwargs)

    def process_bind_param(self, value, dialect):  # noqa: ANN001, ANN201
        if isinstance(value, str):
            try:
                return uuid.UUID(value)
            except ValueError:
                return None
        return value
