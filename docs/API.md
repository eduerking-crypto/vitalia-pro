# API de VITALIA PRO

FastAPI + SQLAlchemy 2.0 async. Por defecto usa **SQLite** (`vitalia.db`) para
poder arrancar sin Docker ni PostgreSQL; en producción se apunta a Postgres
cambiando `DATABASE_URL`.

## Arranque local

```bash
powershell -File scripts/run-api.ps1          # crea venv, siembra y arranca
```

- API: http://localhost:8010
- Docs (Swagger): http://localhost:8010/docs
- Usuario demo: `demo@vitalia.health` / `Demo1234!`

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/login` | Login (JWT) |
| POST | `/api/v1/auth/register` | Registro |
| POST | `/api/v1/auth/refresh` | Renovar token |
| GET/PUT | `/api/v1/users/me` | Perfil |
| GET/PUT | `/api/v1/users/me/medical` | Ficha médica |
| POST/DELETE | `/api/v1/users/me/allergies` | Alergias |
| GET/POST | `/api/v1/health/vitals` | Signos vitales |
| GET/POST | `/api/v1/health/sleep` | Sueño |
| GET/POST | `/api/v1/health/mood` | Ánimo |
| GET | `/api/v1/health/score` | Puntuación de salud |
| GET/POST/PUT/DELETE | `/api/v1/medications` | Medicación |
| GET | `/api/v1/medications/interactions` | Interacciones |
| GET | `/api/v1/medications/adherence` | Adherencia |
| GET/POST/DELETE | `/api/v1/meals?day=YYYY-MM-DD` | Diario de comidas |
| GET | `/api/v1/nutrition/daily-summary?day=` | Resumen diario |
| GET | `/api/v1/nutrition/suggestions` | Sugerencias |
| GET/PUT | `/api/v1/nutrition/goals` | Objetivos |
| GET/POST | `/api/v1/appointments` | Citas |
| GET | `/api/v1/appointments/specialties` | Especialidades |
| POST | `/api/v1/assistant/chat` | Asistente IA |
| GET | `/api/v1/labs` | Laboratorios |
| GET/POST | `/api/v1/documents` | Documentos |
| GET | `/api/v1/notifications` | Notificaciones |
| GET/PUT | `/api/v1/settings` | Ajustes |

## Variables de entorno (`apps/api/.env`)

| Variable | Uso |
|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./vitalia.db` o `postgresql+asyncpg://...` |
| `SECRET_KEY` | Firma de JWT |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma |
| `FIELD_ENCRYPTION_KEY` | Clave Fernet (opcional en desarrollo) |
| `OPENAI_API_KEY` | Opcional: sin ella el asistente usa respuestas locales |

## Conectar la web a la API

El sitio estático se compila con la URL de la API:

```bash
powershell -File scripts/build-static.ps1 `
  -BasePath /vitalia-pro -SkipMobileCopy `
  -ApiUrl https://mi-api.example.com
```

Eso activa `NEXT_PUBLIC_STATIC_AUTH`: el login se hace directo contra la API
(no hay NextAuth en un sitio estático) y los tokens se guardan en el navegador.

> Si la API no responde, el cliente cae automáticamente al modo demostración
> con datos locales, así que la web nunca se queda en blanco.
