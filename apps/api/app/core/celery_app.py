"""Celery application (background jobs: reminders, health scores)."""

from __future__ import annotations

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "vitalia",
    broker=settings.celery_broker_url,
    backend=settings.redis_url,
    include=["app.services.medication_service", "app.services.health_service"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "send-medication-reminders": {
            "task": "app.services.medication_service.send_medication_reminders",
            "schedule": 60.0,  # every minute (demo cadence)
        },
        "compute-health-scores": {
            "task": "app.services.health_service.compute_health_scores",
            "schedule": 3600.0,  # every hour
        },
    },
)
