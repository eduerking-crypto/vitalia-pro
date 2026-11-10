import { Heart, ShieldCheck, Sparkles, Activity } from "lucide-react";

/** Layout público de autenticación: panel de marca + formulario. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bone dark:bg-neutral-950">
      {/* Panel de marca (desktop) */}
      <aside className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-sage-500 via-sage-600 to-serene-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-serene-400/20 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Heart className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-xl font-bold tracking-tight">VITALIA Pro</p>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              Gestión integral de salud
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Tu salud, comprendida y acompañada por IA
          </h1>
          <p className="mt-4 text-white/80">
            Métricas, medicación, nutrición y telemedicina en un solo lugar
            seguro — con agentes especializados que explican tus datos.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {[
              { icon: Activity, text: "Signos vitales, sueño y adherencia con visualización clara" },
              { icon: Sparkles, text: "Asistente IA con agentes de biología y nutrición" },
              { icon: ShieldCheck, text: "Cifrado de campo, audit log encadenado (HIPAA/GDPR)" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm text-white/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          © 2026 VITALIA Health Tech · La información mostrada no sustituye
          la consulta médica.
        </p>
      </aside>

      {/* Formulario */}
      <main className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        {children}
      </main>
    </div>
  );
}
