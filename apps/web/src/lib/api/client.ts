import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/use-auth-store";
import { useNotificationStore } from "@/stores/use-notification-store";
import { API_BASE_URL } from "@/lib/constants";
import { mockAdapter } from "./mock/adapter";

/**
 * Cliente axios de VITALIA.
 * - Inyecta el JWT de acceso en cada petición.
 * - Refresca el token automáticamente ante un 401 (un solo reintento).
 * - Si la API no está disponible, cae al modo demostración (mock local).
 */

const DEMO_FORCED =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  !API_BASE_URL ||
  API_BASE_URL.includes("localhost") ||
  API_BASE_URL.includes("127.0.0.1");

let demoFallbackActive = false;

export function isDemoMode(): boolean {
  return DEMO_FORCED || demoFallbackActive;
}

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

type RetriableConfig = InternalAxiosRequestConfig & {
  _retried?: boolean;
  _mockFallback?: boolean;
};

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;

    // 401 → intentar refresh una vez y repetir la petición.
    if (error.response?.status === 401 && config && !config._retried && !isDemoMode()) {
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken && !refreshToken.startsWith("demo-")) {
        config._retried = true;
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
          config.headers.Authorization = `Bearer ${data.access_token}`;
          return api.request(config);
        } catch {
          useAuthStore.getState().clear();
        }
      }
    }

    // Red caída / timeout → modo demostración con aviso único.
    const networkDown =
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      error.code === AxiosError.ERR_NETWORK ||
      !error.response;

    if (
      networkDown &&
      config &&
      !config._mockFallback &&
      !DEMO_FORCED &&
      !demoFallbackActive
    ) {
      config._mockFallback = true;
      demoFallbackActive = true;
      useNotificationStore.getState().pushToast({
        type: "info",
        title: "Modo demostración activado",
        message:
          "No se pudo conectar con la API. Estás viendo datos de ejemplo locales.",
      });
      return mockAdapter(config);
    }

    throw error;
  },
);

if (DEMO_FORCED) {
  api.defaults.adapter = mockAdapter;
}
