# Arquitectura — VITALIA Pro

## Vista general

```
┌──────────────────────────────┐        ┌──────────────────────────────┐
│  Portal del paciente (web)   │        │  Portal de empresa (web)     │
│  Next.js 15 · App Router     │        │  Next.js 15 · /org           │
└──────────────┬───────────────┘        └──────────────┬───────────────┘
               │  JWT (Bearer)                          │
               └───────────────┬────────────────────────┘
                               ▼
                 ┌───────────────────────────┐
                 │  API FastAPI (async)      │
                 │  /api/v1 · RBAC · audit   │
                 └─────────────┬─────────────┘
                               ▼
                 ┌───────────────────────────┐
                 │  SQLAlchemy 2.0 async     │
                 │  SQLite (dev) / Postgres  │
                 └───────────────────────────┘
```

## Monorepo

```
apps/
  web/      Next.js 15 (paciente + empresa + presentación)
  api/      FastAPI (auth, clínico, organización)
  mobile/   Capacitor → APK Android
packages/
  shared-types/  Contrato de tipos web ⇄ API
scripts/    build estático, publicación, seed, iconos
docs/       negocio, API, despliegue
```

## Modelo multiempresa

Tres tablas nuevas:

| Tabla | Propósito |
|---|---|
| `organizations` | IPS/clínica: nombre, NIT, ciudad, plan, cupos, color de marca |
| `organization_members` | Profesionales y administradores de la organización |
| `organization_patients` | Vinculación paciente ↔ IPS, profesional asignado, riesgo y cohorte |

Reglas:

- Un usuario puede ser paciente de una IPS y, a la vez, profesional de otra (tablas separadas).
- El portal de empresa solo consulta pacientes vinculados a **su** organización (`org_id`).
- Las rutas `/org/*` resuelven la organización desde la membresía del token; sin membresía → `403`.

## Roles y permisos

| Rol | Alcance |
|---|---|
| `patient` | Su propia historia, medicación, comidas, citas, documentos |
| `professional` | Lectura de los pacientes de su organización, agenda |
| `admin` | Todo lo de la organización, equipo, reportes y ajustes |
| `doctor` (global) | Rol heredado para compatibilidad con el modelo clínico |

## Seguridad

1. JWT firmado (HS256) con access de 15 min y refresh de 7 días.
2. Contraseñas con Argon2.
3. Cifrado de campos sensibles con Fernet (AES-128) mediante `EncryptedString`.
4. Auditoría encadenada: cada evento guarda el hash SHA-256 del anterior.
5. CORS restringido a orígenes explícitos.
6. UUID portables (`UUIDStr`) con normalización de cadenas.

## Sitio estático y APK

- `STATIC_EXPORT=true` genera un sitio 100% estático (rama `gh-pages`).
- Las rutas de API se apartan durante el build (no existen en estático).
- `NEXT_PUBLIC_STATIC_AUTH=true` activa el **login directo contra la API** (sin NextAuth).
- Si la API no responde, el cliente cae al modo demostración con datos locales.
- El APK (Capacitor) incluye ese sitio en `assets/public` y funciona sin red.

## Decisiones técnicas y por qué

| Decisión | Motivo |
|---|---|
| SQLite por defecto | Arrancar sin Docker ni Postgres; Postgres en producción vía `DATABASE_URL` |
| Respaldo local en el portal de empresa | La demo nunca se ve vacía si la API falla |
| Tipos UUID portables | Compatibilidad SQLite/PostgreSQL sin cambios de código |
| CSS/tailwind propio | Control total del diseño y accesibilidad AA |
| Recharts | Gráficos ligeros y accesibles con etiquetas ARIA |

## Próximos pasos técnicos

1. Invitaciones por correo con tokens de un solo uso.
2. Persistencia del historial del asistente.
3. WebRTC para videoconsulta.
4. Integración FHIR R4 / HL7.
5. Observabilidad (Sentry + OpenTelemetry) y respaldos automáticos.
6. Pentest y auditoría de cumplimiento antes de contratos grandes.
