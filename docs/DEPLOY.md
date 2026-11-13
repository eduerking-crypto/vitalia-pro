# 🚀 Publicar VITALIA Pro

Tres formas de compartir la app, según lo que necesites.

---

## 1. GitHub Pages (link permanente, gratis)

La web se exporta como sitio estático y se publica en la rama `gh-pages`.

```bash
pnpm build:pages     # export estático con basePath /vitalia-pro
pnpm publish:pages   # sube apps/web/out a la rama gh-pages
```

**URL:** https://eduerking-crypto.github.io/vitalia-pro/

> GitHub Pages sirve el sitio en unos 1-2 minutos tras el push. Se activa en
> *Settings → Pages → Source: Deploy from a branch → gh-pages / (root)*.
>
> Funciona en **modo demostración** (datos locales en el navegador). Las rutas de
> API no existen en un sitio estático, por eso el build las aparta temporalmente.

---

## 2. Vercel / Netlify (con backend opcional)

El proyecto es un monorepo pnpm. En Vercel:

| Ajuste | Valor |
|---|---|
| Root Directory | `apps/web` |
| Framework | Next.js |
| Build Command | `pnpm build` |
| Install Command | `pnpm install` |
| Output | automático |

Variables de entorno mínimas:

```
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://tu-dominio.vercel.app
AUTH_TRUST_HOST=true
NEXT_PUBLIC_DEMO_MODE=true
```

Si despliegas también `apps/api` (Render/Railway/Fly), cambia
`NEXT_PUBLIC_DEMO_MODE=false` y apunta `NEXT_PUBLIC_API_URL` a su URL pública.

---

## 3. Túnel temporal (sin cuenta)

Para enseñar la app desde tu equipo en segundos:

```bash
cloudflared tunnel --url http://localhost:3003
```

Devuelve una URL `https://algo.trycloudflare.com` válida mientras el proceso
siga vivo. No requiere cuenta, pero **cambia cada vez** que reinicias el túnel.

---

## 📱 APK Android

```bash
pnpm build:static                          # export estático → apps/mobile/www
cd apps/mobile && pnpm sync                # copia los assets al proyecto Android
cd android && ./gradlew assembleDebug      # compila el APK
```

Salida: `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

La app **incluye la web dentro del APK**, así que funciona sin conexión y sin
depender de ningún servidor.

Requisitos: JDK 21 + Android SDK (platform 35, build-tools 35.0.0).

### Firma para distribución

```bash
keytool -genkey -v -keystore vitalia.jks -keyalg RSA -keysize 2048 \
        -validity 10000 -alias vitalia
./gradlew assembleRelease
```

Configura el keystore en `apps/mobile/android/app/build.gradle` o en
`~/.gradle/gradle.properties` y **no lo subas al repositorio**.
