# Despliegue permanente

Objetivo: dejar la web pública y la API en servicios gestionados, sin depender
de tu equipo encendido.

---

## 1. API en Render (recomendado)

El repositorio incluye `render.yaml` y `apps/api/Dockerfile`.

1. Entra a Render → **New → Blueprint** y conecta `eduerking-crypto/vitalia-pro`.
2. Render crea:
   - `vitalia-api` (Docker, healthcheck `/health`)
   - `vitalia-db` (PostgreSQL)
3. Configura las variables marcadas como manuales:
   - `CORS_ORIGINS` = `https://eduerking-crypto.github.io,https://tu-dominio.com`
   - `FIELD_ENCRYPTION_KEY` = salida de:
     `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
   - `OPENAI_API_KEY` (opcional)
4. Al terminar, copia la URL pública, por ejemplo `https://vitalia-api.onrender.com`.

> La app normaliza `postgres://` → `postgresql+asyncpg://` automáticamente.
> Al primer arranque se crean las tablas; ejecuta el seed una vez:
> `python -m app.seed` desde la consola del servicio.

### Alternativas
- **Railway / Fly.io**: usan el mismo Dockerfile.
- **Neon / Supabase** para PostgreSQL gestionado (cambia solo `DATABASE_URL`).

---

## 2. Web en Vercel (opcional)

Hoy la web vive en GitHub Pages (estático). Si quieres NextAuth y API routes:

1. Vercel → **New Project** → importa el repositorio.
2. Configura:
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`
3. Variables de entorno:
   ```
   NEXTAUTH_SECRET=<openssl rand -base64 32>
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   AUTH_TRUST_HOST=true
   NEXT_PUBLIC_API_URL=https://vitalia-api.onrender.com
   NEXT_PUBLIC_DEMO_MODE=false
   ```
4. Desactiva `NEXT_PUBLIC_STATIC_AUTH` (solo se usa en el sitio estático).

---

## 3. Web en GitHub Pages (actual)

```bash
# Sitio conectado a la API real
powershell -File scripts/build-static.ps1 `
  -BasePath /vitalia-pro -SkipMobileCopy `
  -ApiUrl https://vitalia-api.onrender.com

pnpm publish:pages
```

- URL: https://eduerking-crypto.github.io/vitalia-pro/
- Para marca blanca usa un dominio propio y `-BasePath ""`.

---

## 4. APK Android

```bash
powershell -File scripts/build-static.ps1 -ApiUrl https://vitalia-api.onrender.com
cd apps/mobile
pnpm sync
cd android && ./gradlew assembleDebug
```

Salida: `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

Para publicar en Play Store:

```bash
keytool -genkey -v -keystore vitalia.jks -keyalg RSA -keysize 2048 -validity 10000 -alias vitalia
./gradlew bundleRelease
```

Firma el bundle con el keystore y súbelo a Play Console (formato AAB).

---

## 5. Checklist antes de vender

- [ ] API en producción con Postgres y respaldos automáticos.
- [ ] `CORS_ORIGINS` con el dominio real.
- [ ] `SECRET_KEY` y `FIELD_ENCRYPTION_KEY` únicas y guardadas en el gestor de secretos.
- [ ] HTTPS obligatorio y HSTS.
- [ ] Correo transaccional para invitaciones (Resend/SendGrid).
- [ ] Monitoreo (Sentry) y alertas de disponibilidad.
- [ ] Política de privacidad, términos y consentimiento informado.
- [ ] Pentest y revisión legal (Ley 1581 / HIPAA / GDPR según mercado).
- [ ] Plan de soporte y SLA definido por contrato.
- [ ] Dominio propio y certificado.

---

## 6. Costos estimados (referencia)

| Servicio | Plan | Costo/mes |
|---|---|---|
| Render Web (API) | Starter | ~US$ 7 |
| Render Postgres | Basic 256 MB | ~US$ 6 |
| Vercel | Hobby/Pro | US$ 0–20 |
| Dominio | anual | ~US$ 12/año |
| Correo transaccional | gratis hasta 3k/mes | US$ 0 |

Un piloto con 500 pacientes cuesta menos de **US$ 40/mes** en infraestructura.
