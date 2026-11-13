"""Normaliza los tipos de los esquemas: UUID y fechas reales (serializan a JSON)."""

from pathlib import Path

SCHEMAS = Path(__file__).resolve().parent.parent / "apps" / "api" / "app" / "schemas"

REPLACEMENTS = [
    ("    id: str", "    id: UUID"),
    ("    user_id: str", "    user_id: UUID"),
    ("    profile_id: str", "    profile_id: UUID"),
    ("    actor_id: str", "    actor_id: UUID"),
    ("    date_of_birth: str | None", "    date_of_birth: date | None"),
    ("    created_at: str", "    created_at: datetime"),
    ("    updated_at: str", "    updated_at: datetime"),
    ("    recorded_at: str", "    recorded_at: datetime"),
    ("    uploaded_at: str", "    uploaded_at: datetime"),
    ("    computed_at: str", "    computed_at: datetime"),
    ("    date: str", "    date: date"),
    ("    start_date: str", "    start_date: date"),
    ("    end_date: str | None", "    end_date: date | None"),
    ("    timestamp: str", "    timestamp: datetime"),
]

HEADER = "from datetime import date, datetime\nfrom uuid import UUID\n"


def main() -> None:
    for path in sorted(SCHEMAS.glob("*.py")):
        if path.name == "__init__.py":
            continue
        text = path.read_text(encoding="utf-8")
        original = text
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        if text == original:
            continue
        if "from uuid import UUID" not in text:
            text = HEADER + text
        elif "from datetime import" not in text:
            text = "from datetime import date, datetime\n" + text
        path.write_text(text, encoding="utf-8")
        print("actualizado:", path.name)


if __name__ == "__main__":
    main()
