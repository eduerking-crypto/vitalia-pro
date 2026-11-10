"""Initial schema for VITALIA PRO.

Creates all tables plus the pgvector extension (PostgreSQL only).
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

# ---- shared column helpers ----

def _uuid() -> sa.Column:
    return sa.Column(
        "id",
        postgresql.UUID(as_uuid=True),
        primary_key=True,
        server_default=sa.text("gen_random_uuid()"),
    )


def _timestamps() -> list[sa.Column]:
    return [
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            onupdate=sa.text("now()"),
            nullable=False,
        ),
    ]


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    if is_postgres:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "users",
        _uuid(),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("biological_sex", sa.String(length=32), nullable=True),
        sa.Column("role", sa.String(length=32), nullable=False, server_default="patient"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("mfa_secret", sa.String(length=255), nullable=True),
        sa.Column("mfa_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        *_timestamps(),
    )

    op.create_table(
        "medical_profiles",
        _uuid(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("blood_type", sa.String(length=8), nullable=True),
        sa.Column("height_cm", sa.Float(), nullable=True),
        sa.Column("weight_kg", sa.Float(), nullable=True),
        sa.Column("chronic_conditions", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("family_history", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("emergency_contact_name", sa.String(length=255), nullable=True),
        sa.Column("emergency_contact_phone_enc", sa.String(length=512), nullable=True),
        sa.Column("insurance_provider", sa.String(length=255), nullable=True),
        sa.Column("insurance_policy", sa.String(length=255), nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "allergies",
        _uuid(),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("medical_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("allergen", sa.String(length=255), nullable=False),
        sa.Column("severity", sa.String(length=32), nullable=False),
        sa.Column("reaction", sa.Text(), nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "medications",
        _uuid(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("active_ingredient", sa.String(length=255), nullable=False),
        sa.Column("dosage", sa.String(length=128), nullable=False),
        sa.Column("frequency", sa.String(length=64), nullable=False),
        sa.Column("time", sa.Time(), nullable=False),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("reminder_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("remaining_quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("rxnorm_code", sa.String(length=64), nullable=True),
        sa.Column("prescribed_by", sa.String(length=255), nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "medication_logs",
        _uuid(),
        sa.Column("medication_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("medications.id", ondelete="CASCADE"), nullable=False),
        sa.Column("taken_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("status", sa.String(length=32), nullable=False),
        *_timestamps(),
    )

    op.create_table(
        "meals",
        _uuid(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("meal_type", sa.String(length=32), nullable=False),
        sa.Column("food_name", sa.String(length=255), nullable=False),
        sa.Column("calories", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("protein_g", sa.Float(), nullable=False, server_default="0"),
        sa.Column("carbs_g", sa.Float(), nullable=False, server_default="0"),
        sa.Column("fat_g", sa.Float(), nullable=False, server_default="0"),
        sa.Column("fiber_g", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=1024), nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "appointments",
        _uuid(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("doctor_name", sa.String(length=255), nullable=False),
        sa.Column("specialty", sa.String(length=255), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("time", sa.Time(), nullable=False),
        sa.Column("modality", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "vital_signs",
        _uuid(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("systolic_bp", sa.Integer(), nullable=True),
        sa.Column("diastolic_bp", sa.Integer(), nullable=True),
        sa.Column("heart_rate", sa.Integer(), nullable=True),
        sa.Column("temperature", sa.Float(), nullable=True),
        sa.Column("oxygen_saturation", sa.Integer(), nullable=True),
        sa.Column("glucose", sa.Integer(), nullable=True),
        sa.Column("weight_kg", sa.Float(), nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "sleep_records",
        _uuid(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("deep_sleep_minutes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("rem_sleep_minutes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("light_sleep_minutes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("awake_minutes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("efficiency", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "mood_records",
        _uuid(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("mood", sa.Integer(), nullable=False),
        sa.Column("emoji", sa.String(length=16), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "lab_results",
        _uuid(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("test_name", sa.String(length=255), nullable=False),
        sa.Column("lab_name", sa.String(length=255), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="review"),
        sa.Column("file_url", sa.String(length=1024), nullable=True),
        sa.Column("values", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        *_timestamps(),
    )
    if is_postgres:
        op.create_column(
            "lab_results",
            sa.Column("embedding", sa.dialects.postgresql.Vector(1536), nullable=True),
        )

    op.create_table(
        "documents",
        _uuid(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(length=512), nullable=False),
        sa.Column("document_type", sa.String(length=128), nullable=False),
        sa.Column("file_url", sa.String(length=1024), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("shared_with", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
    )

    op.create_table(
        "notifications",
        _uuid(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), nullable=False, primary_key=True, autoincrement=True),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(length=255), nullable=False),
        sa.Column("resource_type", sa.String(length=128), nullable=False),
        sa.Column("resource_id", sa.String(length=255), nullable=False),
        sa.Column("details", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("previous_hash", sa.String(length=128), nullable=True),
        sa.Column("hash", sa.String(length=128), nullable=False),
    )

    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_medications_user_id", "medications", ["user_id"])
    op.create_index("ix_appointments_user_id", "appointments", ["user_id"])
    op.create_index("ix_vital_signs_user_id", "vital_signs", ["user_id"])
    op.create_index("ix_lab_results_user_id", "lab_results", ["user_id"])
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("notifications")
    op.drop_table("documents")
    op.drop_table("lab_results")
    op.drop_table("mood_records")
    op.drop_table("sleep_records")
    op.drop_table("vital_signs")
    op.drop_table("appointments")
    op.drop_table("meals")
    op.drop_table("medication_logs")
    op.drop_table("medications")
    op.drop_table("allergies")
    op.drop_table("medical_profiles")
    op.drop_table("users")
