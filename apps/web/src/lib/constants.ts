import {
  Activity,
  Bot,
  ClipboardList,
  FileText,
  FlaskConical,
  HeartPulse,
  Apple,
  Settings,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { AuthResponse } from "@vitalia/shared-types";

/** URL base de la API FastAPI (vacío = modo demo forzado). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Sitio estático publicado (sin NextAuth): login directo contra la API. */
export const STATIC_AUTH = process.env.NEXT_PUBLIC_STATIC_AUTH === "true";

/** Credenciales demo cuando la API no está disponible. */
export const DEMO_CREDENTIALS = {
  email: "demo@vitalia.health",
  password: "Demo1234!",
  authResponse: {
    access_token: "demo-access-token",
    refresh_token: "demo-refresh-token",
    token_type: "bearer",
    expires_in: 900,
    user: {
      id: "00000000-0000-4000-8000-000000000001",
      email: "demo@vitalia.health",
      full_name: "Dra. Elena Ríos",
      date_of_birth: "1988-04-12",
      biological_sex: "female",
      role: "patient",
      is_active: true,
      mfa_enabled: false,
      created_at: "2025-01-15T08:00:00Z",
      updated_at: "2026-11-01T08:00:00Z",
    },
  } satisfies AuthResponse,
} as const;

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Activity, description: "Resumen de tu salud" },
  { href: "/health", label: "Salud", icon: HeartPulse, description: "Signos vitales y sueño" },
  { href: "/medications", label: "Medicamentos", icon: ClipboardList, description: "Tomas y adherencia" },
  { href: "/nutrition", label: "Nutrición", icon: Apple, description: "Diario y macros" },
  { href: "/activity", label: "Actividad", icon: Activity, description: "Pasos y ejercicio" },
  { href: "/assistant", label: "Asistente IA", icon: Bot, description: "Consultas de salud" },
  { href: "/telemedicine", label: "Telemedicina", icon: Stethoscope, description: "Citas médicas" },
  { href: "/labs", label: "Laboratorios", icon: FlaskConical, description: "Resultados analíticos" },
  { href: "/documents", label: "Documentos", icon: FileText, description: "Expediente seguro" },
  { href: "/profile", label: "Perfil", icon: UserRound, description: "Datos médicos" },
  { href: "/settings", label: "Ajustes", icon: Settings, description: "Preferencias" },
];

export const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Snack",
};

export const ALLERGY_SEVERITY_LABELS: Record<string, string> = {
  mild: "Leve",
  moderate: "Moderada",
  severe: "Grave",
  "life-threatening": "Potencialmente mortal",
};

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export const MODALITY_LABELS: Record<string, string> = {
  video: "Videoconsulta",
  in_person: "Presencial",
};

export const LAB_STATUS_LABELS: Record<string, string> = {
  normal: "Normal",
  review: "A revisar",
  critical: "Crítico",
};

/** Meta diaria de hidratación (ml) por defecto. */
export const WATER_DAILY_GOAL_ML = 2000;
/** Mililitros por vaso registrado. */
export const WATER_GLASS_ML = 250;
/** Meta diaria de pasos por defecto. */
export const STEPS_DAILY_GOAL = 8000;

export const AGENTS_INFO = [
  {
    id: "biology" as const,
    name: "Agente Biología",
    description:
      "Fisiología, sueño, sistema cardiovascular y explicación de métricas de laboratorio.",
    capabilities: ["Signos vitales", "Sueño y recuperación", "Interpretación de analíticas"],
  },
  {
    id: "nutrition" as const,
    name: "Agente Nutrición",
    description:
      "Diario de comidas, balance de macros, hidratación y sugerencias personalizadas.",
    capabilities: ["Macros y calorías", "Sugerencias de menú", "Hidratación"],
  },
  {
    id: "security" as const,
    name: "Agente Seguridad",
    description:
      "Interacciones medicamentosas, alertas de urgencia y priorización de síntomas.",
    capabilities: ["Interacciones", "Señales de alarma", "Cuándo acudir al médico"],
  },
];

export const QUERY_KEYS = {
  medications: ["medications"] as const,
  medicationInteractions: ["medications", "interactions"] as const,
  medicationAdherence: ["medications", "adherence"] as const,
  meals: (date: string) => ["meals", date] as const,
  dailySummary: (date: string) => ["nutrition", "summary", date] as const,
  suggestions: ["nutrition", "suggestions"] as const,
  goals: ["nutrition", "goals"] as const,
  vitals: (days: number) => ["health", "vitals", days] as const,
  sleep: (days: number) => ["health", "sleep", days] as const,
  mood: (days: number) => ["health", "mood", days] as const,
  healthScore: ["health", "score"] as const,
  appointments: ["appointments"] as const,
  specialties: ["appointments", "specialties"] as const,
  chatHistory: ["assistant", "history"] as const,
  labs: ["labs"] as const,
  lab: (id: string) => ["labs", id] as const,
  documents: ["documents"] as const,
  notifications: ["notifications"] as const,
  settings: ["settings"] as const,
  profile: ["profile"] as const,
  medicalProfile: ["profile", "medical"] as const,
};
