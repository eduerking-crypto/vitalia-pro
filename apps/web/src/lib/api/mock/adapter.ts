import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import {
  buildAppointments,
  buildDocuments,
  buildLabs,
  buildMeals,
  buildMedications,
  buildMood,
  buildNotifications,
  buildSleep,
  buildVitals,
  mockAdherence,
  mockChatReply,
  mockGoals,
  mockHealthScore,
  mockInteractions,
  mockMedicalProfile,
  mockSettings,
  mockSpecialties,
  mockSuggestions,
  mockUser,
  summarizeMeals,
} from "./data";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import type {
  Appointment,
  ChatMessage,
  DailySummary,
  LabResult,
  Meal,
  MedicalDocument,
  Medication,
  NutritionGoals,
  VitalSign,
} from "@vitalia/shared-types";

/**
 * Adaptador axios que simula la API FastAPI de VITALIA en el navegador.
 * Se activa cuando la API real no está disponible (modo demostración).
 */

interface RouteContext {
  params: Record<string, string>;
  query: URLSearchParams;
  body: Record<string, unknown>;
  config: InternalAxiosRequestConfig;
}

type RouteHandler = (ctx: RouteContext) => unknown;

interface Route {
  method: string;
  pattern: string;
  handler: RouteHandler;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const uid = (prefix: string) =>
  `${prefix}${Math.floor(Math.random() * 1e12).toString().padStart(12, "0")}`;

/* ---------- estado en memoria ---------- */

let user = clone(mockUser);
let medicalProfile = clone(mockMedicalProfile);
let settings = clone(mockSettings);
let medications = buildMedications();
let meals = buildMeals();
let appointments = buildAppointments();
let labs = buildLabs();
let documents = buildDocuments();
let notifications = buildNotifications();
let goals: NutritionGoals = clone(mockGoals);
let chatHistory: ChatMessage[] = [];

export function resetMockState() {
  user = clone(mockUser);
  medicalProfile = clone(mockMedicalProfile);
  settings = clone(mockSettings);
  medications = buildMedications();
  meals = buildMeals();
  appointments = buildAppointments();
  labs = buildLabs();
  documents = buildDocuments();
  notifications = buildNotifications();
  goals = clone(mockGoals);
  chatHistory = [];
}

/* ---------- helpers ---------- */

function httpError(
  config: InternalAxiosRequestConfig,
  status: number,
  message: string,
): never {
  throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, null, {
    status,
    data: { detail: message },
    statusText: message,
    headers: {},
    config,
  } as AxiosResponse);
}

function assertDefined<T>(value: T | undefined, config: InternalAxiosRequestConfig, msg: string): T {
  if (value === undefined || value === null) httpError(config, 404, msg);
  return value as T;
}

function strBody(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") httpError(body as unknown as InternalAxiosRequestConfig, 422, `Campo obligatorio: ${key}`);
  return value.trim();
}

function numBody(body: Record<string, unknown>, key: string, fallback?: number): number {
  const value = body[key];
  if (value === undefined || value === null || value === "") {
    if (fallback !== undefined) return fallback;
    httpError(body as unknown as InternalAxiosRequestConfig, 422, `Campo obligatorio: ${key}`);
  }
  const n = Number(value);
  if (Number.isNaN(n)) httpError(body as unknown as InternalAxiosRequestConfig, 422, `Campo numérico inválido: ${key}`);
  return n;
}

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* ---------- rutas ---------- */

const routes: Route[] = [
  // AUTH
  {
    method: "POST",
    pattern: "/auth/login",
    handler: ({ body, config }) => {
      const email = String(body.email ?? "").toLowerCase().trim();
      const password = String(body.password ?? "");
      if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
        httpError(config, 401, "Credenciales inválidas.");
      }
      return clone(DEMO_CREDENTIALS.authResponse);
    },
  },
  {
    method: "POST",
    pattern: "/auth/register",
    handler: ({ body }) => ({
      id: uid("d"),
      email: String(body.email ?? ""),
      full_name: String(body.full_name ?? ""),
      date_of_birth: String(body.date_of_birth ?? ""),
      biological_sex: "unspecified",
      role: "patient",
      is_active: true,
      mfa_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  },
  {
    method: "POST",
    pattern: "/auth/refresh",
    handler: () => ({ access_token: "demo-access-token", refresh_token: "demo-refresh-token", token_type: "bearer", expires_in: 900 }),
  },
  { method: "POST", pattern: "/auth/logout", handler: () => ({ ok: true }) },
  { method: "POST", pattern: "/auth/mfa/verify", handler: () => clone(DEMO_CREDENTIALS.authResponse) },

  // USUARIOS
  { method: "GET", pattern: "/users/me", handler: () => clone(user) },
  {
    method: "PUT",
    pattern: "/users/me",
    handler: ({ body }) => {
      user = { ...user, ...(body as Partial<typeof user>), updated_at: new Date().toISOString() };
      return clone(user);
    },
  },
  { method: "GET", pattern: "/users/me/medical", handler: () => clone(medicalProfile) },
  {
    method: "PUT",
    pattern: "/users/me/medical",
    handler: ({ body }) => {
      medicalProfile = { ...medicalProfile, ...(body as Partial<typeof medicalProfile>) };
      return clone(medicalProfile);
    },
  },
  {
    method: "POST",
    pattern: "/users/me/allergies",
    handler: ({ body }) => {
      const allergy = {
        id: uid("e"),
        profile_id: medicalProfile.id,
        allergen: strBody(body, "allergen"),
        severity: (String(body.severity ?? "mild") as any),
        reaction: String(body.reaction ?? ""),
      };
      medicalProfile.allergies.push(allergy);
      return allergy;
    },
  },
  {
    method: "DELETE",
    pattern: "/users/me/allergies/:id",
    handler: ({ params, config }) => {
      const before = medicalProfile.allergies.length;
      medicalProfile.allergies = medicalProfile.allergies.filter((a) => a.id !== params.id);
      if (medicalProfile.allergies.length === before) httpError(config, 404, "Alergia no encontrada.");
      return { ok: true };
    },
  },

  // MEDICAMENTOS
  { method: "GET", pattern: "/medications", handler: () => clone(medications) },
  {
    method: "POST",
    pattern: "/medications",
    handler: ({ body }) => {
      const medication: Medication = {
        id: uid("f"),
        user_id: user.id,
        name: strBody(body, "name"),
        active_ingredient: strBody(body, "active_ingredient"),
        dosage: strBody(body, "dosage"),
        frequency: body.frequency as Medication["frequency"],
        time: strBody(body, "time"),
        instructions: String(body.instructions ?? ""),
        start_date: strBody(body, "start_date"),
        end_date: (body.end_date as string | null) ?? null,
        is_active: true,
        reminder_enabled: body.reminder_enabled !== false,
        remaining_quantity: numBody(body, "remaining_quantity", 30),
        rxnorm_code: "",
        prescribed_by: String(body.prescribed_by ?? ""),
      };
      medications = [medication, ...medications];
      return medication;
    },
  },
  {
    method: "PUT",
    pattern: "/medications/:id",
    handler: ({ params, body, config }) => {
      const med = assertDefined(medications.find((m) => m.id === params.id), config, "Medicamento no encontrado.");
      Object.assign(med, body);
      return clone(med);
    },
  },
  {
    method: "DELETE",
    pattern: "/medications/:id",
    handler: ({ params, config }) => {
      const before = medications.length;
      medications = medications.filter((m) => m.id !== params.id);
      if (medications.length === before) httpError(config, 404, "Medicamento no encontrado.");
      return { ok: true };
    },
  },
  {
    method: "PATCH",
    pattern: "/medications/:id/taken",
    handler: ({ params, body, config }) => {
      assertDefined(medications.find((m) => m.id === params.id), config, "Medicamento no encontrado.");
      return {
        id: uid("1"),
        medication_id: params.id,
        taken_at: new Date().toISOString(),
        status: (body.status as string | undefined) ?? "taken",
      };
    },
  },
  {
    method: "GET",
    pattern: "/medications/interactions",
    handler: () => ({ interactions: clone(mockInteractions), checked_at: new Date().toISOString() }),
  },
  {
    method: "GET",
    pattern: "/medications/adherence",
    handler: () => ({
      ...clone(mockAdherence),
      by_medication: medications.map((m, i) => ({
        medication_id: m.id,
        name: m.name,
        adherence_rate: [92, 95, 88, 70, 99, 86][i % 6] ?? 90,
      })),
    }),
  },

  // NUTRICIÓN
  {
    method: "GET",
    pattern: "/meals",
    handler: ({ query }) => {
      const date = query.get("date") ?? todayStr();
      return clone(meals.filter((m) => m.date === date));
    },
  },
  {
    method: "POST",
    pattern: "/meals",
    handler: ({ body }) => {
      const meal: Meal = {
        id: uid("2"),
        user_id: user.id,
        date: String(body.date ?? todayStr()),
        meal_type: body.meal_type as Meal["meal_type"],
        food_name: strBody(body, "food_name"),
        calories: numBody(body, "calories"),
        protein_g: numBody(body, "protein_g"),
        carbs_g: numBody(body, "carbs_g"),
        fat_g: numBody(body, "fat_g"),
        fiber_g: numBody(body, "fiber_g", 0),
        notes: String(body.notes ?? ""),
        image_url: (body.image_url as string | null) ?? null,
      };
      meals = [...meals, meal];
      return meal;
    },
  },
  {
    method: "DELETE",
    pattern: "/meals/:id",
    handler: ({ params, config }) => {
      const before = meals.length;
      meals = meals.filter((m) => m.id !== params.id);
      if (meals.length === before) httpError(config, 404, "Comida no encontrada.");
      return { ok: true };
    },
  },
  {
    method: "GET",
    pattern: "/nutrition/daily-summary",
    handler: ({ query }): DailySummary => summarizeMeals(meals, query.get("date") ?? todayStr()),
  },
  { method: "GET", pattern: "/nutrition/suggestions", handler: () => clone(mockSuggestions) },
  { method: "GET", pattern: "/nutrition/goals", handler: () => clone(goals) },
  {
    method: "PUT",
    pattern: "/nutrition/goals",
    handler: ({ body }) => {
      goals = { ...goals, ...(body as Partial<NutritionGoals>) };
      return clone(goals);
    },
  },

  // SALUD
  {
    method: "GET",
    pattern: "/health/vitals",
    handler: ({ query }) => buildVitals(Number(query.get("days") ?? 30)),
  },
  {
    method: "POST",
    pattern: "/health/vitals",
    handler: ({ body }) => {
      const vital: VitalSign = {
        id: uid("3"),
        user_id: user.id,
        recorded_at: (body.recorded_at as string | undefined) ?? new Date().toISOString(),
        systolic_bp: numBody(body, "systolic_bp"),
        diastolic_bp: numBody(body, "diastolic_bp"),
        heart_rate: numBody(body, "heart_rate"),
        temperature: numBody(body, "temperature", 36.5),
        oxygen_saturation: numBody(body, "oxygen_saturation", 97),
        glucose: numBody(body, "glucose", 90),
        weight_kg: numBody(body, "weight_kg", 64),
      };
      return vital;
    },
  },
  { method: "GET", pattern: "/health/sleep", handler: ({ query }) => buildSleep(Number(query.get("days") ?? 14)) },
  { method: "POST", pattern: "/health/sleep", handler: ({ body }) => ({ id: uid("4"), user_id: user.id, date: todayStr(), ...body }) },
  { method: "GET", pattern: "/health/mood", handler: ({ query }) => buildMood(Number(query.get("days") ?? 14)) },
  { method: "POST", pattern: "/health/mood", handler: ({ body }) => ({ id: uid("5"), user_id: user.id, date: todayStr(), ...body }) },
  { method: "GET", pattern: "/health/score", handler: () => clone(mockHealthScore) },

  // CITAS
  { method: "GET", pattern: "/appointments/specialties", handler: () => clone(mockSpecialties) },
  { method: "GET", pattern: "/appointments", handler: () => clone(appointments) },
  {
    method: "POST",
    pattern: "/appointments",
    handler: ({ body }) => {
      const appointment: Appointment = {
        id: uid("6"),
        user_id: user.id,
        doctor_name: strBody(body, "doctor_name"),
        specialty: strBody(body, "specialty"),
        date: strBody(body, "date"),
        time: strBody(body, "time"),
        modality: body.modality as Appointment["modality"],
        status: "pending",
        reason: String(body.reason ?? ""),
        notes: String(body.notes ?? ""),
      };
      appointments = [appointment, ...appointments];
      return appointment;
    },
  },
  {
    method: "PUT",
    pattern: "/appointments/:id",
    handler: ({ params, body, config }) => {
      const appt = assertDefined(appointments.find((a) => a.id === params.id), config, "Cita no encontrada.");
      Object.assign(appt, body);
      return clone(appt);
    },
  },
  {
    method: "DELETE",
    pattern: "/appointments/:id",
    handler: ({ params, config }) => {
      const before = appointments.length;
      appointments = appointments.filter((a) => a.id !== params.id);
      if (appointments.length === before) httpError(config, 404, "Cita no encontrada.");
      return { ok: true };
    },
  },

  // ASISTENTE IA
  {
    method: "POST",
    pattern: "/assistant/chat",
    handler: ({ body }) => {
      const message = strBody(body, "message");
      const userMessage: ChatMessage = {
        id: uid("7"),
        user_id: user.id,
        role: "user",
        content: message,
        agent: null,
        created_at: new Date().toISOString(),
      };
      const response = mockChatReply(message);
      chatHistory = [...chatHistory, userMessage, response.message];
      return response;
    },
  },
  { method: "GET", pattern: "/assistant/history", handler: () => clone(chatHistory) },
  {
    method: "DELETE",
    pattern: "/assistant/history",
    handler: () => {
      chatHistory = [];
      return { ok: true };
    },
  },

  // LABORATORIOS
  { method: "GET", pattern: "/labs", handler: () => clone(labs) },
  {
    method: "GET",
    pattern: "/labs/:id",
    handler: ({ params, config }) => assertDefined(clone(labs).find((l) => l.id === params.id), config, "Resultado no encontrado."),
  },
  {
    method: "POST",
    pattern: "/labs",
    handler: ({ body }) => {
      const lab: LabResult = {
        id: uid("8"),
        user_id: user.id,
        test_name: strBody(body, "test_name"),
        lab_name: strBody(body, "lab_name"),
        date: strBody(body, "date"),
        status: "review",
        file_url: "#",
        values: (body.values as LabResult["values"]) ?? [],
      };
      labs = [lab, ...labs];
      return lab;
    },
  },

  // DOCUMENTOS
  { method: "GET", pattern: "/documents", handler: () => clone(documents) },
  {
    method: "POST",
    pattern: "/documents",
    handler: ({ body }) => {
      const doc: MedicalDocument = {
        id: uid("9"),
        user_id: user.id,
        filename: String(body.filename ?? "documento.pdf"),
        document_type: String(body.document_type ?? "Otro"),
        file_url: "#",
        file_size: numBody(body, "file_size", 102_400),
        uploaded_at: new Date().toISOString(),
        shared_with: [],
      };
      documents = [doc, ...documents];
      return doc;
    },
  },
  {
    method: "DELETE",
    pattern: "/documents/:id",
    handler: ({ params, config }) => {
      const before = documents.length;
      documents = documents.filter((d) => d.id !== params.id);
      if (documents.length === before) httpError(config, 404, "Documento no encontrado.");
      return { ok: true };
    },
  },
  {
    method: "POST",
    pattern: "/documents/share",
    handler: ({ body }) => {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      return {
        document_id: String(body.document_id ?? ""),
        share_url: `https://vitalia.health/s/${uid("ab")}`,
        expires_at: expires.toISOString(),
      };
    },
  },

  // NOTIFICACIONES
  { method: "GET", pattern: "/notifications", handler: () => clone(notifications) },
  {
    method: "PATCH",
    pattern: "/notifications/:id/read",
    handler: ({ params, config }) => {
      const n = assertDefined(notifications.find((x) => x.id === params.id), config, "Notificación no encontrada.");
      n.is_read = true;
      return clone(n);
    },
  },
  {
    method: "PATCH",
    pattern: "/notifications/read-all",
    handler: () => {
      notifications.forEach((n) => {
        n.is_read = true;
      });
      return { ok: true };
    },
  },

  // AJUSTES
  { method: "GET", pattern: "/settings", handler: () => clone(settings) },
  {
    method: "PUT",
    pattern: "/settings",
    handler: ({ body }) => {
      settings = { ...settings, ...(body as Partial<typeof settings>) };
      return clone(settings);
    },
  },
];

/* ---------- matching ---------- */

function matchRoute(method: string, path: string): { route: Route; params: Record<string, string> } | null {
  const pathSegments = path.split("/").filter(Boolean);
  for (const route of routes) {
    if (route.method !== method.toUpperCase()) continue;
    const patternSegments = route.pattern.split("/").filter(Boolean);
    if (patternSegments.length !== pathSegments.length) continue;
    const params: Record<string, string> = {};
    let ok = true;
    for (let i = 0; i < patternSegments.length; i++) {
      const patternSeg = patternSegments[i]!;
      const pathSeg = pathSegments[i]!;
      if (patternSeg.startsWith(":")) {
        params[patternSeg.slice(1)] = decodeURIComponent(pathSeg);
      } else if (patternSeg !== pathSeg) {
        ok = false;
        break;
      }
    }
    if (ok) return { route, params };
  }
  return null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Adaptador axios: simula latencia y resuelve contra el estado mock. */
export const mockAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const method = (config.method ?? "get").toUpperCase();

  let path = (config.url ?? "/").split("?")[0] ?? "/";
  const base = config.baseURL ?? "";
  const full = base + path;
  path = full.replace(/^https?:\/\/[^/]+/, "").replace(/\/api\/v1/, "") || "/";

  const query = new URLSearchParams();
  const params = (config.params ?? {}) as Record<string, string | number | boolean>;
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });

  let body: Record<string, unknown> = {};
  if (typeof config.data === "string") {
    try {
      body = JSON.parse(config.data) as Record<string, unknown>;
    } catch {
      body = {};
    }
  } else if (config.data && typeof config.data === "object") {
    body = config.data as Record<string, unknown>;
  }

  await sleep(180 + Math.random() * 320);

  const matched = matchRoute(method, path);
  if (!matched) {
    httpError(config, 404, `Ruta no implementada en modo demo: ${method} ${path}`);
  }

  const data = matched.route.handler({ params: matched.params, query, body, config });

  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  };
};
