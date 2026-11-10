"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, UserRound, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { Button, Input, Alert } from "@/components/ui";
import { registerWithApi } from "@/lib/api/server-auth";

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Al menos una mayúscula")
  .regex(/[0-9]/, "Al menos un número");

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Indica tu nombre completo"),
    email: z.string().email("Introduce un correo válido"),
    date_of_birth: z.string().min(1, "Indica tu fecha de nacimiento"),
    password: passwordSchema,
    confirm_password: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Debes aceptar los términos" }),
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const submit = async (values: RegisterForm) => {
    setLoading(true);
    setError(null);

    try {
      const result = await registerWithApi({
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        date_of_birth: values.date_of_birth,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setError(null);
      await router.push("/login");
    } catch {
      setError("No se pudo crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-[color:var(--color-surface)] p-6 rounded-2xl shadow-card border border-[color:var(--color-border)]">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sage-400 to-serene-500 text-white">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="leading-tight text-left">
            <p className="text-base font-bold tracking-tight">
              VITALIA<span className="text-sage-500"> Pro</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-secondary">
              Crear cuenta
            </p>
          </div>
        </div>

        {error && <Alert variant="danger" title="No se pudo registrar">{error}</Alert>}

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden="true" />
            <Input
              label="Nombre completo"
              placeholder="Ana García López"
              error={errors.full_name?.message}
              {...register("full_name")}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden="true" />
            <Input
              label="Correo electrónico"
              placeholder="ana@correo.com"
              error={errors.email?.message}
              {...register("email")}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden="true" />
            <Input
              label="Fecha de nacimiento"
              type="date"
              error={errors.date_of_birth?.message}
              {...register("date_of_birth")}
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
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden="true" />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="••••••••"
              error={errors.confirm_password?.message}
              {...register("confirm_password")}
              className="pl-10"
            />
          </div>
          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              required
              {...register("terms")}
              className="mt-0.5 h-4 w-4 rounded border-[color:var(--color-border)] text-sage-600 focus:ring-sage-500"
            />
            <label htmlFor="terms" className="text-sm text-secondary leading-6">
              Acepto los <a href="#" className="text-serene-500 hover:underline">términos de servicio</a> y la{" "}
              <a href="#" className="text-serene-500 hover:underline">política de privacidad</a>
            </label>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Crear cuenta <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-secondary">
          Ya tienes cuenta?{" "}
          <a href="/login" className="font-medium text-serene-500 hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
