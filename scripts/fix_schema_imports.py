"""Reubica las importaciones añadidas justo después de `from __future__ import annotations`."""

from pathlib import Path

SCHEMAS = Path(__file__).resolve().parent.parent / "apps" / "api" / "app" / "schemas"
HEADER_LINES = {"from datetime import date, datetime", "from uuid import UUID"}
FUTURE = "from __future__ import annotations"


def main() -> None:
    for path in sorted(SCHEMAS.glob("*.py")):
        if path.name == "__init__.py":
            continue
        lines = path.read_text(encoding="utf-8").splitlines()
        # Quita copias del encabezado (arriba del todo y duplicadas)
        lines = [ln for ln in lines if ln.strip() not in HEADER_LINES]
        if FUTURE in [ln.strip() for ln in lines]:
            idx = next(i for i, ln in enumerate(lines) if ln.strip() == FUTURE)
            lines[idx + 1:idx + 1] = ["", "from datetime import date, datetime", "from uuid import UUID"]
        else:
            lines = ["from datetime import date, datetime", "from uuid import UUID", ""] + lines
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        print("ok:", path.name)


if __name__ == "__main__":
    main()
