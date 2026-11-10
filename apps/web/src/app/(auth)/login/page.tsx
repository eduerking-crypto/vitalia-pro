"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight, Heart } from "lucide-react";
import { Button, Input, Alert, Card, CardHeader, CardContent } from "@/components/ui";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import { isDemoMode } from "@/lib/api/client";

const loginSchema = z.object({
  email: z.string().email("Introduce un correo válido"),
  password: z.string().min(1, "Introduce tu contraseña"),
  mfaCode: z.string().optional(),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showMfa, setShowMfa] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const submit = async (values: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        mfaCode: values.mfaCode ?? undefined,
        redirect: false,
      });

      if (result?.error) {
        setError("Correo o contraseña incorrectos.");
        setShowMfa(true);
        return;
      }

      await router.push("/");
      await router.refresh();
    } catch {
      setError("No se pudo iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    reset({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      mfaCode: undefined,
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full bg-[color:var(--color-surface)]">
        <CardHeader className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sage-400 to-serene-500 text-white">
              <Heart className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="leading-tight text-left">
              <p className="text-base font-bold tracking-tight">
                VITALIA<span className="text-sage-500"> Pro</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-secondary">
                Iniciar sesión
              </p>
            </div>
          </div>
          {isDemoMode() && (
            <p className="mt-3 text-xs text-secondary">
              Modo demostración — puedes usar las credenciales de abajo.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="danger" title="Error al iniciar sesión">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden="true" />
              <Input
                label="Correo electrónico"
                placeholder="nombre@correo.com"
                error={errors.email?.message}
                {...register("email")}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden="true" />
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
                className="pl-10"
              />
            </div>
            {showMfa && (
              <Input
                label="Código MFA (6 dígitos)"
                placeholder="123456"
                error={errors.mfaCode?.message}
                {...register("mfaCode")}
                maxLength={6}
              />
            )}
            <Button type="submit" loading={loading} className="w-full">
              Iniciar sesión <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
          </form>
          <p className="text-center text-sm text-secondary">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="font-medium text-serene-500 hover:underline">
              Crea una
            </a>
          </p>
          <hr className="border-[color:var(--color-border)]" />
          <div className="grid gap-2 text-center">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-secondary">Usuario demo:</p>
              <button
                type="button"
                onClick={fillDemo}
                className="text-xs text-serene-500 underline underline-offset-4 hover:text-serene-600"
              >
                {DEMO_CREDENTIALS.email}
              </button>
              <p className="text-xs font-medium text-secondary">Contraseña:</p>
              <button
                type="button"
                onClick={() =>
                  reset({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password, mfaCode: undefined })
                }
                className="text-xs text-serene-500 underline underline-offset-4 hover:text-serene-600"
              >
                {DEMO_CREDENTIALS.password}
              </button>
            </div>
            <p className="text-xs text-secondary italic">
              La información mostrada no sustituye la consulta médica.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
