"""Lab result schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class LabMetricOut(BaseModel):
    name: str
    value: float
    unit: str
    reference_min: float
    reference_max: float
    status: str


class LabResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    test_name: str
    lab_name: str
    date: str
    status: str
    file_url: str
    values: list[LabMetricOut] = []


class LabMetricIn(BaseModel):
    name: str
    value: float
    unit: str
    reference_min: float
    reference_max: float


class LabResultCreate(BaseModel):
    test_name: str = Field(min_length=1)
    lab_name: str = Field(min_length=1)
    date: str
    values: list[LabMetricIn] = Field(default_factory=list)
