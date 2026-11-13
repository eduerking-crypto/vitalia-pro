# Levanta la API de VITALIA en local (SQLite, sin Docker).
# Uso: powershell -File scripts/run-api.ps1 [-Port 8010]
param([int]$Port = 8010)

$ErrorActionPreference = "Stop"
$api = Resolve-Path (Join-Path $PSScriptRoot "..\apps\api")
Set-Location $api

if (-not (Test-Path ".venv")) {
    Write-Host "-> Creando entorno virtual..." -ForegroundColor Cyan
    python -m venv .venv
    .\.venv\Scripts\python.exe -m pip install --upgrade pip --quiet
    .\.venv\Scripts\python.exe -m pip install --quiet `
        fastapi "uvicorn[standard]" sqlalchemy aiosqlite pydantic pydantic-settings `
        passlib argon2-cffi "python-jose[cryptography]" pyotp slowapi python-multipart `
        cryptography httpx email-validator langchain-core langgraph openai celery redis greenlet
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

Write-Host "-> Sembrando datos de demostracion (idempotente)..." -ForegroundColor Cyan
.\.venv\Scripts\python.exe -m app.seed

Write-Host "-> API en http://localhost:$Port/docs" -ForegroundColor Green
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port $Port
