import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

/** Combina clases de Tailwind de forma segura. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = "d MMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: es });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "d MMM yyyy, HH:mm");
}

export function formatTimeHM(time: string | Date): string {
  // Acepta "HH:mm", "HH:mm:ss" o un ISO completo ("2026-01-01T09:30:00").
  const raw =
    typeof time === "string" && time.includes("T") ? (time.split("T")[1] ?? "00:00") : time;
  const d = typeof raw === "string" ? parseISO(`2000-01-01T${raw}`) : raw;
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "HH:mm");
}

/** "Hoy", "Ayer" o fecha corta relativa. */
export function relativeDay(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Hoy";
  if (isYesterday(d)) return "Ayer";
  return format(d, "EEEE d 'de' MMMM", { locale: es });
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return `hace ${formatDistanceToNowStrict(d, { locale: es })}`;
}

export function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function todayIso(): string {
  return new Date().toISOString();
}

export function todayDateIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return "Bajo peso";
  if (bmi < 25) return "Peso saludable";
  if (bmi < 30) return "Sobrepeso";
  return "Obesidad";
}

export function formatMinutesAsHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ageFromDob(dob: string): number {
  return differenceInCalendarDays(new Date(), parseISO(dob)) / 365.25;
}

/** Mensaje de error humanizado para fallos de red/API. */
export function apiErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const detail = (error as { response?: { data?: { detail?: string } } }).response?.data
      ?.detail;
    if (detail) return detail;
  }
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    if (code === "ECONNABORTED") return "La petición excedió el tiempo de espera.";
    if (code === "ERR_NETWORK") return "No hay conexión con la API.";
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
