'use client';

// ============================================================================
// /activar — PANTALLA 14: "Crea tu contraseña" (activación de especialista)
// ============================================================================
// Se llega desde el enlace del correo de aprobación (pantalla 13). El especialista
// define él mismo su contraseña (mín. 12) vía POST /auth/activate-specialist con
// el token de un solo uso. Nunca se envía contraseña por correo.
// ============================================================================

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Loader2, Eye, EyeOff, CheckCircle2, KeyRound, AlertTriangle } from 'lucide-react';

import { apiPost } from '@/lib/api-client';
import { AuthAside } from '@/components/auth-aside';

const schema = z
  .object({
    password: z.string().min(12, 'Mínimo 12 caracteres').max(128),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  });

type FormValues = z.infer<typeof schema>;

function ActivateInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [show, setShow] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await apiPost<{ message: string }>('/auth/activate-specialist', {
        token,
        password: values.password,
      });
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const msg = error.response?.data?.message;
      setServerError(
        Array.isArray(msg)
          ? msg.join(' · ')
          : msg || 'No pudimos activar tu cuenta. El enlace puede haber expirado.',
      );
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-bone-50">
      <div className="flex flex-col justify-center p-8 md:p-16">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-bone-50 group-hover:bg-teal-800 transition-colors">
              <Brain size={18} strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl tracking-tightest font-medium">NeuroAlert</span>
          </Link>

          {!token ? (
            <div className="rounded-2xl bg-coral-50 border border-coral-200 p-6">
              <AlertTriangle className="text-coral-600 mb-3" size={32} />
              <h1 className="font-display text-2xl mb-2">Enlace inválido</h1>
              <p className="text-sm text-ink-soft">
                Falta el token de activación. Abre el enlace directamente desde el correo de
                aprobación que te enviamos.
              </p>
            </div>
          ) : done ? (
            <div className="rounded-2xl bg-teal-50 border border-teal-200 p-6 text-center">
              <CheckCircle2 className="mx-auto text-teal-700 mb-3" size={40} />
              <h1 className="font-display text-2xl mb-2">¡Cuenta activada!</h1>
              <p className="text-sm text-ink-soft">
                Tu contraseña quedó configurada. Te llevamos al inicio de sesión…
              </p>
            </div>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-coral-700 mb-2">
                <KeyRound size={13} /> Bienvenido al equipo
              </span>
              <h1 className="font-display text-4xl tracking-tightest mb-2">Crea tu contraseña</h1>
              <p className="text-ink-mute mb-8">
                Establece tu contraseña para acceder a tu cuenta profesional de NeuroAlert.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="password" className="label">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Mínimo 12 caracteres"
                      className="input pr-11"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-teal-700"
                      aria-label={show ? 'Ocultar' : 'Mostrar'}
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-coral-600 mt-1.5">{errors.password.message}</p>}
                </div>

                <div>
                  <label htmlFor="passwordConfirm" className="label">Confirmar contraseña</label>
                  <input
                    id="passwordConfirm"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    className="input"
                    {...register('passwordConfirm')}
                  />
                  {errors.passwordConfirm && (
                    <p className="text-xs text-coral-600 mt-1.5">{errors.passwordConfirm.message}</p>
                  )}
                </div>

                {serverError && (
                  <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-800">
                    {serverError}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Activar cuenta'}
                </button>
              </form>

              <p className="mt-8 text-sm text-ink-mute text-center">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-teal-700 font-medium hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <AuthAside
        eyebrow="Cuenta profesional"
        quote="Ya formas parte del equipo NeuroAlert."
        caption="Define tu contraseña para acceder a tu panel de especialista y empezar a acompañar familias."
        footer="Enlace de un solo uso · nunca enviamos contraseñas por correo."
      />
    </main>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bone-50" />}>
      <ActivateInner />
    </Suspense>
  );
}
