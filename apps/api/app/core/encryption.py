"""Field-level encryption for sensitive data (Fernet, AES-256)."""

from __future__ import annotations

import base64

from cryptography.fernet import Fernet
from sqlalchemy.types import TypeDecorator, String

from app.core.config import settings


class EncryptedString(TypeDecorator):
    """Transparent Fernet encryption for a String column."""

    impl = String
    cache_ok = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        key = settings.field_encryption_key
        if not key:
            # Deterministic dev key so the app boots without an env var.
            key = base64.urlsafe_b64encode(b"dev-field-key-32-bytes-aes-256!!").decode()
        self._fernet = Fernet(key.encode())

    def process_bind_param(self, value: str | None, dialect) -> str | None:
        if value is None:
            return None
        return self._fernet.encrypt(value.encode("utf-8")).decode("utf-8")

    def process_result_value(self, value: str | None, dialect) -> str | None:
        if value is None:
            return None
        try:
            return self._fernet.decrypt(value.encode("utf-8")).decode("utf-8")
        except Exception:  # pragma: no cover - rotated keys / corrupt data
            return value
