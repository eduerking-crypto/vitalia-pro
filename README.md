# 🌿 VITALIA Pro — Gestión Integral de Salud

Aplicación de gestión integral de salud con métricas personales, medicación con
detección de interacciones, nutrición asistida por IA, telemedicina, laboratorios
y expediente médico seguro. Diseñada bajo criterios **HIPAA** y **GDPR**.

![Stack](https://img.shields.io/badge/Next.js%2015-App%20Router-000000)
![Stack](https://img.shields.io/badge/FastAPI-Python%203.12-009688)
![Stack](https://img.shields.io/badge/PostgreSQL%2016-pgvector-336791)
![Demo](https://img.shields.io/badge/demo-sin%20backend-4a7c59)

---

## ⚡ Acceso rápido
 
| | |
|---|---|
| **Demo pública** | https://eduerking-crypto.github.io/vitalia-pro/ |
| **Repositorio** | https://github.com/eduerking-crypto/vitalia-pro |
| **APK Android** | [última release](https://github.com/eduerking-crypto/vitalia-pro/releases/latest) |
| **API** | local (`scripts/run-api.ps1`) · ver [docs/API.md](docs/API.md) |

En local, en un minuto:

```bash
pnpm install
pnpm dev:3003
```

Abre **http://localhost:3003** → entra directo al dashboard, sin backend ni base de datos.

> En modo demo todos los datos son de ejemplo y viven en el navegador
> (`localStorage`). No se envía nada a ningún servidor.

Credenciales de referencia: `demo@vitalia.health` / `Demo1234!`

---

## ✨ Funcionalidades (11 pantallas)

| Módulo | Ruta | Descripción |
|---|---|---|
| **Dashboard** | `/` | Puntuación de salud, pasos, sueño, ritmo cardíaco, hidratación y tomas del día |
| **Salud** | `/health` | Signos vitales (TA, FC, SpO₂, glucosa), sueño por fases, ánimo y registro manual |
| **Medicamentos** | `/medications` | Toma con recordatorios, adherencia, stock y **detección de interacciones** fármaco-fármaco |
| **Nutrición** | `/nutrition` | Diario de comidas con macros, metas personalizables y **sugerencias IA** |
| **Actividad** | `/activity` | Pasos, ejercicio y gráficos de la semana |
| **Asistente IA** | `/assistant` | Chat con agentes especializados (biología, nutrición, seguridad) |
| **Telemedicina** | `/telemedicine` | Especialidades, agendamiento y videoconsulta |
| **Laboratorios** | `/labs` | Resultados con visualización frente a rangos de referencia |
| **Documentos** | `/documents` | Expediente cifrado con enlaces de compartir con expiración |
| **Perfil** | `/profile` | Alergias, condiciones crónicas y credencial de emergencia |
| **Ajustes** | `/settings` | Tema claro/oscuro, accesibilidad y preferencias |

---

## 🏗️ Stack

- **Frontend**: Next.js 15 (App Router) · TypeScript estricto · Tailwind CSS ·
  Zustand · TanStack Query · React Hook Form + Zod · Recharts · Framer Motion · NextAuth v5
- **Backend**: FastAPI (Python 3.12) · SQLAlchemy 2.0 async · Alembic · Pydantic v2 ·
  JWT + OAuth2 · Celery + Redis · LangGraph + LangChain + OpenAI
- **Datos**: PostgreSQL 16 + pgvector (embeddings) · Redis 7 (caché/colas)
- **Infra**: Docker Compose · GitHub Actions · Sentry/OpenTelemetry (preparado)
- **Monorepo**: pnpm workspaces · `@vitalia/shared-types` (contrato de tipos compartido)

---

## 📁 Estructura

```
vitalia-pro/
├── apps/
│   ├── web/          # Next.js 15 (App Router, design system propio, 18 componentes UI)
│   ├── api/          # FastAPI (auth JWT+MFA, RBAC, audit log encadenado, Fernet)
│   └── mobile/       # Envoltorio Android (Capacitor) → genera el APK
├── packages/
│   └── shared-types/ # Tipos compartidos web ⇄ API (fuente única de verdad)
├── docker-compose.yml        # Entorno de desarrollo completo
├── docker-compose.prod.yml   # Overrides de producción
├── Makefile                  # Atajos: make setup / dev / test / lint / seed
└── .github/workflows/        # CI (lint+typecheck+build web, ruff+pytest api) y deploy
```

> Los workflows de CI están en `.github/workflows/` pero se mantienen **fuera del
> repositorio** mientras el token de GitHub no tenga el scope `workflow`.

---

## 🚀 Puesta en marcha

### Sin backend (modo demostración) — recomendado para probar

```bash
pnpm install
pnpm dev:3003       # http://localhost:3003
```

### Con Docker (stack completo)

```bash
docker compose up -d --build
```

- **Web**: http://localhost:3000
- **API (docs Swagger)**: http://localhost:8000/docs
- **Usuario demo**: `demo@vitalia.health` / `Demo1234!` (seed con datos de ejemplo)

> Sin Docker también puedes levantar `db` y `redis` con Docker y correr
> `pnpm --filter @vitalia/web dev` + `uvicorn app.main:app --reload` (ver `Makefile`).

### Datos de prueba

```bash
make seed   # docker compose exec api python -m app.seed
```

### API con SQLite (sin Docker)

```bash
powershell -File scripts/run-api.ps1   # crea venv, siembra y arranca en :8010
```

- API: http://localhost:8010 · Swagger: http://localhost:8010/docs
- Detalle de endpoints y variables: [docs/API.md](docs/API.md)

La web puede compilarse apuntando a esa API (`-ApiUrl`), y el cliente cae al
modo demostración si el backend no responde.

---

## 📱 APK Android

`apps/mobile/` contiene el envoltorio **Capacitor** que empaqueta la web como app
instalable (WebView a pantalla completa apuntando a la URL publicada).

```bash
cd apps/mobile
pnpm install
# edita capacitor.config.ts → server.url con tu URL pública
pnpm build:apk        # genera app-debug.apk
```

Salida: `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

---

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

---

## 🧪 Calidad

```bash
pnpm typecheck   # tsc --noEmit (web)
pnpm lint        # ESLint (web)
make test        # pytest (api) + typecheck (web)
```

---

## ⚙️ Variables de entorno

Copia `apps/web/.env.example` → `apps/web/.env.local`. Las variables críticas:

| Variable | Uso |
|---|---|
| `NEXTAUTH_SECRET` | Firma de sesiones (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL pública de la web |
| `AUTH_TRUST_HOST` | `true` detrás de proxy/túnel (Cloudflare, Vercel…) |
| `NEXT_PUBLIC_API_URL` | Endpoint de la API FastAPI |
| `NEXT_PUBLIC_DEMO_MODE` | `true` para funcionar sin backend |

En la raíz, `.env.example` cubre las variables de Docker Compose (`SECRET_KEY`,
`FIELD_ENCRYPTION_KEY`, `CORS_ORIGINS`, `OPENAI_API_KEY`…). `OPENAI_API_KEY` es
opcional: sin ella, los agentes IA responden con lógica heurística local.

---

## 📝 Notas de implementación

- El frontend apunta a la API vía `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:8000`).
- El paquete `@vitalia/shared-types` espeja los esquemas Pydantic y se comparte
  con `transpilePackages` para mantener el contrato web ⇄ API.
- El worker Celery envía recordatorios de medicación y recalcula puntuaciones de salud.
- Migraciones: `make migrate` (Alembic async, extensión pgvector incluida).

---

## 🗺️ Roadmap

- [x] Modo demostración sin backend (datos locales)
- [x] APK Android vía Capacitor
- [ ] Sala de videoconsulta WebRTC
- [ ] Integración FHIR R4 completa (`integrations/fhir_client.py`)
- [ ] Observabilidad con Sentry + OpenTelemetry en producción
- [ ] PWA con notificaciones push

---

© 2026 VITALIA Health Tech — La información proporcionada no sustituye la
consulta con un profesional sanitario.
