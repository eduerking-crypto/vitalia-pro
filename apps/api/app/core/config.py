"""Application settings for VITALIA PRO."""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    VITALIA_ENV: str = Field(default="development")
    SECRET_KEY: str = Field(default="dev-secret-change-me-in-production")
    DATABASE_URL: str = Field(default="postgresql+asyncpg://vitalia:vitalia@localhost:5432/vitalia")
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/1")
    CORS_ORIGINS: str = Field(default="http://localhost:3000")
    FIELD_ENCRYPTION_KEY: str = Field(default="")
    OPENAI_API_KEY: str = Field(default="")
    SENTRY_DSN: str = Field(default="")

    # Security
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_GENERAL: str = "100/minute"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
