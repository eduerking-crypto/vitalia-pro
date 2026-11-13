import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  Check,
  FileText,
  HeartPulse,
  Lock,
  MessageSquareHeart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

/** Página de presentación comercial: qué es VITALIA, para quién y cuánto cuesta. */

const MODULES = [
  { icon: HeartPulse, title: "Seguimiento clínico", text: "Signos vitales, sueño, ánimo y puntuación de salud con históricos." },
  { icon: CalendarCheck, title: "Agenda y telemedicina", text: "Citas, videoconsulta y recordatorios automáticos." },
  { icon: MessageSquareHeart, title: "Asistente con IA", text: "Orientación en biología, nutrición y alertas de seguridad." },
  { icon: FileText, title: "Expediente seguro", text: "Documentos cifrados con enlaces temporales y auditoría." },
  { icon: BarChart3, title: "Analítica para la IPS", text: "Adherencia, riesgo y cohortes en un panel de dirección." },
  { icon: Smartphone, title: "App Android", text: "APK instalable con la web incluida; funciona aun sin red." },
];

const IPS_FEATURES = [
  "Panel con KPIs de la organización",
  "Pacientes priorizados por riesgo",
  "Adherencia por profesional y cohorte",
  "Agenda centralizada del equipo",
  "Auditoría de accesos a datos clínicos",
  "Exportación de reportes a CSV",
];

const PATIENT_FEATURES = [
  "Historia clínica personal",
  "Medicamentos con recordatorios",
  "Diario de nutrición y actividad",
  "Laboratorios interpretados",
  "Asistente de salud 24/7",
  "Credencial de emergencia",
];

const PLANS = [
  {
    name: "Esencial",
    price: "US$ 1,50",
    unit: "por paciente / mes",
    description: "Consultorios y equipos pequeños que empiezan a digitalizar.",
    features: ["Hasta 250 pacientes", "Portal de paciente", "Agenda y recordatorios", "Soporte por correo"],
    highlighted: false,
  },
  {
    name: "Profesional",
    price: "US$ 2,90",
    unit: "por paciente / mes",
    description: "IPS y clínicas con equipo asistencial y metas de adherencia.",
    features: [
      "Hasta 2.000 pacientes",
      "Portal de empresa completo",
      "Analítica y reportes",
      "Roles y permisos",
      "Soporte prioritario",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "A medida",
    unit: "contrato anual",
    description: "Redes de salud, aseguradoras y integraciones FHIR.",
    features: [
      "Pacientes ilimitados",
      "Multi-sede y multi-tenant",
      "Integración FHIR / HL7",
      "SLA y entorno dedicado",
      "Onboarding y capacitación",
    ],
    highlighted: false,
  },
];

export default function PresentacionPage() {
  return (
    <div className="min-h-screen bg-bone dark:bg-neutral-950">
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/presentacion" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sage-400 to-serene-500 text-white">
              <HeartPulse className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-bold tracking-tight">
              VITALIA<span className="text-sage-500"> Pro</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-secondary md:flex" aria-label="Secciones">
            <a href="#producto" className="hover:text-ink">Producto</a>
            <a href="#portales" className="hover:text-ink">Portales</a>
            <a href="#seguridad" className="hover:text-ink">Seguridad</a>
            <a href="#planes" className="hover:text-ink">Planes</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/org"
              className="hidden rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm font-semibold hover:bg-neutral-50 sm:block dark:hover:bg-neutral-900"
            >
              Portal empresa
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-sage-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sage-700"
            >
              Ver demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700 dark:bg-sage-700/30 dark:text-sage-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Plataforma de salud digital para IPS y aseguradoras
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
              Tus pacientes acompañados.
              <br />
              <span className="text-sage-600">Tu IPS, con datos.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-secondary">
              VITALIA Pro une el portal del paciente con un panel de gestión clínica:
              adherencia, riesgo, agenda y resultados en un solo lugar. Menos llamadas,
              más continuidad del cuidado.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/org"
                className="inline-flex items-center gap-2 rounded-lg bg-serene-600 px-5 py-3 text-sm font-semibold text-white hover:bg-serene-700"
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Entrar como empresa
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] px-5 py-3 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <HeartPulse className="h-4 w-4 text-sage-600" aria-hidden="true" />
                Entrar como paciente
              </Link>
            </div>
            <p className="mt-4 text-xs text-secondary">
              Demo con datos ficticios · sin registro · acceso inmediato
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Adherencia media", value: "74%", hint: "+12 pts en 6 semanas" },
              { label: "Pacientes en riesgo", value: "20%", hint: "priorizados por alerta" },
              { label: "Tiempo por consulta", value: "-35%", hint: "con expediente unificado" },
              { label: "Cobertura del equipo", value: "24/7", hint: "asistente y recordatorios" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-soft"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{kpi.label}</p>
                <p className="mt-1 text-3xl font-bold tabular-nums">{kpi.value}</p>
                <p className="mt-1 text-xs text-secondary">{kpi.hint}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Producto */}
        <section id="producto" className="border-y border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">Todo el cuidado, en una plataforma</h2>
            <p className="mt-2 max-w-2xl text-sm text-secondary">
              Once módulos clínicos que el paciente usa a diario y la IPS supervisa desde el panel.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((m) => (
                <div key={m.title} className="rounded-xl border border-[color:var(--color-border)] p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100 text-sage-700 dark:bg-sage-700/30 dark:text-sage-200">
                    <m.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 font-semibold">{m.title}</h3>
                  <p className="mt-1 text-sm text-secondary">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dos portales */}
        <section id="portales" className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">Dos portales, una sola fuente de verdad</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-serene-200 bg-serene-50/50 p-6 dark:border-serene-700/40 dark:bg-serene-700/10">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-serene-600 text-white">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">Portal de empresa</h3>
                  <p className="text-xs text-secondary">Dirección médica, coordinación y calidad</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {IPS_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-serene-600" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/org" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-serene-700 hover:underline dark:text-serene-300">
                Abrir portal de empresa
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-2xl border border-sage-200 bg-sage-50/50 p-6 dark:border-sage-700/40 dark:bg-sage-700/10">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-600 text-white">
                  <HeartPulse className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">Portal del paciente</h3>
                  <p className="text-xs text-secondary">Autocuidado con acompañamiento clínico</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {PATIENT_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sage-700 hover:underline dark:text-sage-300">
                Abrir portal del paciente
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Seguridad */}
        <section id="seguridad" className="border-y border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold tracking-tight">Seguridad desde el diseño</h2>
              <p className="mt-2 text-sm text-secondary">
                Preparado para operar bajo HIPAA y GDPR: mínimo privilegio, trazabilidad y cifrado.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              {[
                { icon: Lock, title: "Cifrado de campos sensibles", text: "Fernet (AES-128) en datos identificables." },
                { icon: ShieldCheck, title: "Auditoría encadenada", text: "Hash SHA-256 por cada acceso a historia clínica." },
                { icon: Users, title: "Roles y permisos", text: "Paciente, profesional y administrador separados." },
                { icon: Stethoscope, title: "Trazabilidad clínica", text: "Quién vio, cuándo y qué recurso, siempre registrado." },
              ].map((s) => (
                <div key={s.title} className="rounded-xl border border-[color:var(--color-border)] p-4">
                  <s.icon className="h-5 w-5 text-serene-600" aria-hidden="true" />
                  <p className="mt-2 font-semibold">{s.title}</p>
                  <p className="mt-1 text-xs text-secondary">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Planes */}
        <section id="planes" className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">Planes que crecen contigo</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-secondary">
              Pago por paciente activo, sin costos ocultos. Precios de referencia para conversación comercial.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlighted
                    ? "relative rounded-2xl border-2 border-sage-500 bg-[color:var(--color-surface)] p-6 shadow-card"
                    : "rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6"
                }
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-6 rounded-full bg-sage-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Recomendado
                  </span>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-xs text-secondary">{plan.description}</p>
                <p className="mt-4 text-3xl font-bold">{plan.price}</p>
                <p className="text-xs text-secondary">{plan.unit}</p>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/org"
                  className={
                    plan.highlighted
                      ? "mt-6 flex items-center justify-center gap-2 rounded-lg bg-sage-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sage-700"
                      : "mt-6 flex items-center justify-center gap-2 rounded-lg border border-[color:var(--color-border)] px-4 py-2.5 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  }
                >
                  Probar el portal
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-secondary">
            Piloto de 30 días sin costo para IPS · acompañamiento de implementación incluido.
          </p>
        </section>

        {/* CTA final */}
        <section className="bg-gradient-to-br from-sage-600 to-serene-700">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
            <h2 className="text-2xl font-bold text-white lg:text-3xl">Lleva VITALIA a tu IPS esta semana</h2>
            <p className="max-w-xl text-sm text-white/80">
              Demo guiada de 20 minutos con tus propios indicadores. Sin instalar nada.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/org"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-serene-800 hover:bg-white/90"
              >
                Ver panel de empresa
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="https://github.com/eduerking-crypto/vitalia-pro/releases/latest"
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Smartphone className="h-4 w-4" aria-hidden="true" />
                Descargar APK
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[color:var(--color-border)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-secondary sm:flex-row">
          <p>© 2026 VITALIA Health Tech · La información no sustituye la consulta médica.</p>
          <nav className="flex gap-4" aria-label="Enlaces del pie">
            <Link href="/presentacion" className="hover:text-ink">Producto</Link>
            <Link href="/org" className="hover:text-ink">Empresas</Link>
            <Link href="/" className="hover:text-ink">Pacientes</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
