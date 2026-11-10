# 🌿 VITALIA Pro — Gestión Integral de Salud

Aplicación de gestión integral de salud con métricas personales, medicación con
detección de interacciones, nutrición asistida por IA, telemedicina, laboratorios
y expediente médico seguro. Diseñada bajo criterios **HIPAA** y **GDPR**.

![Stack](https://img.shields.io/badge/Next.js%2015-App%20Router-000000) ![Stack](https://img.shields.io/badge/FastAPI-Python%203.12-009688) ![Stack](https://img.shields.io/badge/PostgreSQL%2016-pgvector-336791)

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| **Dashboard** | Puntuación de salud, pasos, sueño, ritmo cardíaco, hidratación y tomas del día |
| **Salud** | Signos vitales (TA, FC, SpO₂, glucosa), sueño por fases, ánimo y registro manual |
| **Medicamentos** | Toma con recordatorios, adherencia, stock y **detección de interacciones** fármaco-fármaco |
| **Nutrición** | Diario de comidas con macros, metas personalizables y **sugerencias IA** |
| **Asistente IA** | Chat con agentes especializados (biología, nutrición, seguridad) orquestados con **LangGraph** |
| **Telemedicina** | Especialidades, agendamiento y videoconsulta |
| **Laboratorios** | Resultados con visualización frente a rangos de referencia |
| **Documentos** | Expediente cifrado con enlaces de compartir con expiración |
| **Perfil médico** | Alergias, condiciones crónicas y credencial de emergencia |

## 🏗️ Stack

- **Frontend**: Next.js 15 (App Router) · TypeScript estricto · Tailwind CSS ·
  Zustand · TanStack Query · React Hook Form + Zod · Recharts · Framer Motion · NextAuth v5
- **Backend**: FastAPI (Python 3.12) · SQLAlchemy 2.0 async · Alembic · Pydantic v2 ·
  JWT + OAuth2 · Celery + Redis · LangGraph + LangChain + OpenAI
- **Datos**: PostgreSQL 16 + pgvector (embeddings) · Redis 7 (caché/colas)
- **Infra**: Docker Compose · GitHub Actions · Sentry/OpenTelemetry (preparado)
- **Monorepo**: pnpm workspaces · `@vitalia/shared-types` (contrato de tipos compartido)

## 📁 Estructura

```
vitalia-pro/
├── apps/
│   ├── web/          # Next.js (App Router, design system propio, 18 componentes UI)
│   └── api/          # FastAPI (auth JWT+MFA, RBAC, audit log encadenado, Fernet)
├── packages/
│   └── shared-types/ # Tipos compartidos web ⇄ API (fuente única de verdad)
├── docker-compose.yml        # Entorno de desarrollo completo
├── docker-compose.prod.yml   # Overrides de producción
├── Makefile                  # Atajos: make setup / dev / test / lint / seed
└── .github/workflows/        # CI (lint+typecheck+build web, ruff+pytest api) y deploy
```

## 🚀 Puesta en marcha

### Con Docker (recomendado)

```bash
docker compose up -d --build
```

- **Web**: http://localhost:3000
- **API (docs Swagger)**: http://localhost:8000/docs
- **Usuario demo**: `demo@vitalia.health` / `Demo1234!` (seed con datos de ejemplo)

> Sin Docker también puedes levantar `db` y `redis` con Docker y correr
> `pnpm --filter @vitalia/web dev` + `uvicorn app.main:app --reload` (ver `Makefile`).

### Sin backend (modo demostración)

El frontend detecta cuando la API no está disponible y sirve **datos de ejemplo
locales** automáticamente (banner «Modo demostración»). Útil para probar la UI:

```bash
cd apps/web
pnpm install && pnpm dev
```

### Datos de prueba

```bash
make seed   # docker compose exec api python -m app.seed
```

## 🔐 Seguridad (HIPAA / GDPR)

1. **JWT** con access token de 15 min y refresh de 7 días + renovación automática en el cliente
2. **Argon2** para el hash de contraseñas
3. **MFA con TOTP** (verificación en dos pasos compatible con Google Authenticator)
4. **Rate limiting** — 100 req/min por usuario; 10/min en `/auth/*`
5. **CORS** restringido a dominios autorizados
6. **Audit log con hash encadenado** (SHA-256) en cada acceso a PHI
7. **Cifrado a nivel de campo** (Fernet) para datos sensibles
8. **RBAC** con roles `patient` / `doctor` / `admin`
9. Sanitización y validación estricta de todas las entradas (Pydantic v2 + Zod)

> ⚠️ Producción requiere HTTPS obligatorio (terminación TLS en el proxy/orquestador).

## 🧪 Calidad

```bash
make lint    # ESLint (web) + Ruff (api)
make test    # pytest (api) + typecheck (web)
```

CI en GitHub Actions ejecuta lint, typecheck y build del frontend; ruff y la
suite pytest del backend (con PostgreSQL 16 + Redis como servicios de CI).

## ⚙️ Variables de entorno

Copia `.env.example` → `.env`. Las variables críticas de producción:
`SECRET_KEY`, `FIELD_ENCRYPTION_KEY` (Fernet), `NEXTAUTH_SECRET`, `CORS_ORIGINS`.
`OPENAI_API_KEY` es opcional: sin ella, los agentes IA responden con lógica
heurística local (modo degradado sin llamadas externas).

## 📝 Notas de implementación

- El frontend apunta a la API vía `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:8000`).
- El paquete `@vitalia/shared-types` espeja los esquemas Pydantic y se comparte
  con `transpilePackages` para mantener el contrato web ⇄ API.
- El worker Celery envía recordatorios de medicación y recalcula puntuaciones de salud.
- Migraciones: `make migrate` (Alembic async, extensión pgvector incluida).

## 🗺️ Roadmap

- [ ] Sala de videoconsulta WebRTC
- [ ] Integración FHIR R4 completa (`integrations/fhir_client.py`)
- [ ] Observabilidad con Sentry + OpenTelemetry en producción
- [ ] PWA con notificaciones push
- [ ] App móvil (React Native)

---

© 2026 VITALIA Health Tech — La información proporcionada no sustituye la
consulta con un profesional sanitario.
