# VITALIA PRO — API (FastAPI)
# Build: docker build -f apps/api/Dockerfile -t vitalia-api apps/api

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Dependencias (se instalan explícitamente para evitar builds de paquetes nativos pesados)
RUN pip install --upgrade pip && \
    pip install \
      fastapi "uvicorn[standard]" sqlalchemy asyncpg aiosqlite greenlet \
      pydantic pydantic-settings passlib argon2-cffi "python-jose[cryptography]" \
      pyotp slowapi python-multipart cryptography httpx email-validator \
      langchain-core langgraph openai celery redis

COPY app ./app

# Usuario sin privilegios
RUN useradd --create-home --uid 10001 vitalia && chown -R vitalia:vitalia /app
USER vitalia

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
