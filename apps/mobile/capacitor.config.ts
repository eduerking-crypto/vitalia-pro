import type { CapacitorConfig } from "@capacitor/cli";

/**
 * VITALIA Pro — app Android.
 *
 * La web se compila en modo estático (next build con STATIC_EXPORT=true) y se
 * empaqueta dentro del APK en `www/`, por lo que la app funciona sin conexión
 * y sin depender de un servidor externo.
 */
const config: CapacitorConfig = {
  appId: "health.vitalia.pro",
  appName: "VITALIA Pro",
  webDir: "www",
  android: {
    allowMixedContent: false,
    backgroundColor: "#f7f5ef",
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
