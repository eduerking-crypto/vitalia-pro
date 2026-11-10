"""Local drug-drug interaction matrix."""

# severity: minor | moderate | major | contraindicated
_INTERACTIONS: dict[frozenset[str], dict[str, str]] = {
    frozenset({"warfarina", "ibuprofeno"}): {
        "severity": "major",
        "description": "El ibuprofeno inhibe la agregación plaquetaria y desplaza la warfarina de su unión proteica, aumentando el riesgo de hemorragia.",
        "recommendation": "Evita el ibuprofeno. Usa paracetamol si es necesario y controla el INR si ya lo tomaste conjuntamente.",
    },
    frozenset({"losartán", "ibuprofeno"}): {
        "severity": "moderate",
        "description": "Los AINE pueden reducir el efecto antihipertensivo del losartán y afectar la función renal.",
        "recommendation": "Limita el uso de AINE y controla la tensión arterial si lo usas de forma puntual.",
    },
    frozenset({"metformina", "omeprazol"}): {
        "severity": "minor",
        "description": "El omeprazol puede modificar ligeramente la absorción de metformina (efecto clínico limitado).",
        "recommendation": "Separa las tomas 2 horas cuando sea posible.",
    },
    frozenset({"warfarina", "aspirina"}): {
        "severity": "major",
        "description": "La aspirina potencia el efecto anticoagulante de la warfarina y aumenta el riesgo de sangrado.",
        "recommendation": "Evita la aspirina salvo indicación expresa de tu médico.",
    },
    frozenset({"metformina", "alcohol"}): {
        "severity": "moderate",
        "description": "El consumo excesivo de alcohol con metformina aumenta el riesgo de acidosis láctica.",
        "recommendation": "Limita el consumo de alcohol y consulta con tu médico.",
    },
    frozenset({"losartán", "ácido acetilsalicílico"}): {
        "severity": "moderate",
        "description": "Puede reducir el efecto antihipertensivo y afectar la función renal.",
        "recommendation": "Controla la tensión si usas ambos fármacos.",
    },
    frozenset({"warfarina", "paracetamol"}): {
        "severity": "minor",
        "description": "Dosis altas de paracetamol pueden elevar ligeramente el INR.",
        "recommendation": "No excedas la dosis diaria recomendada de paracetamol.",
    },
}


def _norm(name: str) -> str:
    return name.strip().lower()


def check(names: list[str]) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    normalized = [_norm(n) for n in names]
    keys = [frozenset(pair) for pair in _INTERACTIONS]
    for i in range(len(normalized)):
        for j in range(i + 1, len(normalized)):
            pair = frozenset({normalized[i], normalized[j]})
            if pair in _INTERACTIONS:
                info = _INTERACTIONS[pair]
                results.append(
                    {
                        "medication_a": names[i],
                        "medication_b": names[j],
                        "severity": info["severity"],
                        "description": info["description"],
                        "recommendation": info["recommendation"],
                    }
                )
    return results
