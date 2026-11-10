"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { LogOut, Moon, Palette, ShieldCheck, Sun } from "lucide-react";
import { Button, Toggle } from "@/components/ui";
import { useSettings } from "@/stores/use-settings-store";
import { updateSettings } from "@/lib/api/settings";
import { toast } from "@/stores/use-notification-store";

export default function SettingsPage() {
  const { setTheme, resolvedTheme } = useTheme();
  const settings = useSettings((s) => s.settings);
  const updateSettingsStore = useSettings((s) => s.updateSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSettings(settings)
        .then(() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 1200);
        })
        .catch(() => toast.warning("No se pudo sincronizar con la API"));
    }, 400);
    return () => clearTimeout(timer);
  }, [settings, updateSettings]);

  const toggleTheme = (theme: "light" | "dark" | "system") => {
    setTheme(theme);
    updateSettingsStore({ theme });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Ajustes</h1>
        <p className="text-sm text-secondary">
          Personaliza la apariencia, las notificaciones y tus preferencias.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <AppearanceCard setTheme={toggleTheme} resolvedTheme={resolvedTheme as "light" | "dark" | "system"} />
        <NotificationsCard />
        <UnitsCard />
        <PrivacyCard />
      </div>

      <AccountCard />
      {saved && <div className="rounded-lg bg-success px-3 py-2 text-xs text-white">Guardado</div>}
    </div>
  );
}

function AppearanceCard({
  setTheme,
  resolvedTheme,
}: {
  setTheme: (theme: "light" | "dark" | "system") => void;
  resolvedTheme: "light" | "dark" | "system";
}) {
  return (
    <div className="card-surface p-5 space-y-4">
      <h2 className="text-sm font-semibold">Apariencia</h2>
      <p className="text-xs text-secondary">Elige el tema de la aplicación.</p>
      <div className="flex gap-2">
        <ThemeButton theme="light" label="Claro" icon={<Sun className="h-4 w-4" />} setTheme={setTheme} active={resolvedTheme === "light"} />
        <ThemeButton theme="dark" label="Oscuro" icon={<Moon className="h-4 w-4" />} setTheme={setTheme} active={resolvedTheme === "dark"} />
        <ThemeButton theme="system" label="Sistema" icon={<Palette className="h-4 w-4" />} setTheme={setTheme} active={resolvedTheme === "system"} />
      </div>
    </div>
  );
}

function ThemeButton({
  theme,
  label,
  icon,
  setTheme,
  active,
}: {
  theme: "light" | "dark" | "system";
  label: string;
  icon: React.ReactNode;
  setTheme: (theme: "light" | "dark" | "system") => void;
  active: boolean;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "primary" : "outline"}
      onClick={() => setTheme(theme)}
      className="flex items-center justify-center gap-2 font-medium"
    >
      {icon}
      {label}
    </Button>
  );
}

function NotificationsCard() {
  const settings = useSettings((s) => s.settings);
  const updateSettings = useSettings((s) => s.updateSettings);

  return (
    <div className="card-surface p-5 space-y-4">
      <h2 className="text-sm font-semibold">Notificaciones</h2>
      <p className="text-xs text-secondary">Elige qué avisos quieres recibir.</p>
      <Toggle
        label="Recordatorios de medicación"
        description="Te avisamos cuando llega la hora de tomar un fármaco"
        checked={settings.notifications.medications}
        onChange={(v) => updateSettings({ notifications: { ...settings.notifications, medications: v } })}
      />
      <Toggle
        label="Recordatorios de citas"
        description="Avisos previos a tus videoconsultas y visitas presenciales"
        checked={settings.notifications.appointments}
        onChange={(v) => updateSettings({ notifications: { ...settings.notifications, appointments: v } })}
      />
      <Toggle
        label="Logros y rachas"
        description="Celebramos tus hitos de salud y adherencia"
        checked={settings.notifications.achievements}
        onChange={(v) => updateSettings({ notifications: { ...settings.notifications, achievements: v } })}
      />
      <Toggle
        label="Informe semanal"
        description="Resumen de tu actividad, sueño y nutrición cada semana"
        checked={settings.notifications.weekly_report}
        onChange={(v) => updateSettings({ notifications: { ...settings.notifications, weekly_report: v } })}
      />
    </div>
  );
}

function UnitsCard() {
  const settings = useSettings((s) => s.settings);
  const updateSettings = useSettings((s) => s.updateSettings);

  return (
    <div className="card-surface p-5 space-y-4">
      <h2 className="text-sm font-semibold">Unidades de medida</h2>
      <p className="text-xs text-secondary">Preferencias para peso, temperatura y distancia.</p>
      <div className="grid gap-4">
        <UnitField
          label="Peso"
          value={settings.units.weight as "kg" | "lb"}
          onChange={(v) => updateSettings({ units: { ...settings.units, weight: v as "kg" | "lb" } })}
          options={["kg", "lb"]}
          labels={["kg (kilogramos)", "lb (libras)"]}
        />
        <UnitField
          label="Temperatura"
          value={settings.units.temperature as "c" | "f"}
          onChange={(v) => updateSettings({ units: { ...settings.units, temperature: v as "c" | "f" } })}
          options={["c", "f"]}
          labels={["°C", "°F"]}
        />
        <UnitField
          label="Distancia"
          value={settings.units.distance as "km" | "mi"}
          onChange={(v) => updateSettings({ units: { ...settings.units, distance: v as "km" | "mi" } })}
          options={["km", "mi"]}
          labels={["km (kilómetros)", "mi (millas)"]}
        />
      </div>
    </div>
  );
}

function UnitField({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-secondary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-[color:var(--color-border)] bg-white px-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
      >
        {options.map((opt, i) => (
          <option key={opt} value={opt}>{labels[i]}</option>
        ))}
      </select>
    </div>
  );
}

function PrivacyCard() {
  const settings = useSettings((s) => s.settings);
  const updateSettings = useSettings((s) => s.updateSettings);

  return (
    <div className="card-surface p-5 space-y-4">
      <h2 className="text-sm font-semibold">Privacidad</h2>
      <p className="text-xs text-secondary">Controla cómo se usan tus datos de salud.</p>
      <Toggle
        label="Permitir sugerencias de IA"
        description="El asistente puede usar tu perfil para personalizar respuestas"
        checked={settings.privacy.allow_ai_suggestions}
        onChange={(v) => updateSettings({ privacy: { ...settings.privacy, allow_ai_suggestions: v } })}
      />
      <Toggle
        label="Compartir datos anonimizados"
        description="Ayuda a mejorar el modelo con datos agregados y sin identificar"
        checked={settings.privacy.share_anonymized_data}
        onChange={(v) => updateSettings({ privacy: { ...settings.privacy, share_anonymized_data: v } })}
      />
      <div className="rounded-lg border border-sage-200 bg-sage-50 px-3 py-2 text-xs text-sage-700 dark:border-sage-700/30 dark:bg-neutral-800 dark:text-sage-300">
        <ShieldCheck className="mt-0.5 h-4 w-4 mr-2 shrink-0 text-sage-600" aria-hidden="true" />
        Tus datos nunca se venden. El acceso al historial médico queda registrado
        en un audit log con hash encadenado (HIPAA / GDPR).
      </div>
    </div>
  );
}

function AccountCard() {
  return (
    <div className="card-surface p-5 space-y-4">
      <h2 className="text-sm font-semibold">Cuenta</h2>
      <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
        Cerrar sesión
      </Button>
      <hr className="border-[color:var(--color-border)]" />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Eliminar mi cuenta</p>
        <p className="text-xs text-secondary">
          Esta acción será gestionada por el backend con verificación de identidad.
        </p>
      </div>
    </div>
  );
}
