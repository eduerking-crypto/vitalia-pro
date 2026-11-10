"""FHIR R4 stub client."""

from __future__ import annotations


async def fhir_patient_summary(patient_id: str) -> dict[str, object]:
    return {
        "resourceType": "Patient",
        "id": patient_id,
        "active": True,
        "note": "FHIR client stub — implement against your FHIR R4 server.",
    }
