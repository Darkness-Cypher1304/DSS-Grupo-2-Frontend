'use client';

// ============================================================================
// /reset-password — landing del enlace de reseteo de contraseña (RF-06)
// ============================================================================
// El backend envía un correo con enlace a /reset-password?token=... Esta página
// recoge el token y la nueva contraseña (POST /auth/reset-password). Sin esta
// página, el enlace de reseteo daba 404 (solo existía /forgot-password).
// ============================================================================

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, CheckCircle2, Loader2, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';

import { apiPost } from '@/lib/api-client';
import { AuthAside } from '@/components/auth-aside';

const MIN_PASSWORD = 12;

function ResetPasswordInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('El enlace de reseteo es inválido o está incompleto. Solicita uno nuevo.');
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await apiPost<{ message: string }>('/auth/reset-password', { token, newPassword: password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'No pudimos actualizar tu contraseña. El enlace pudo expirar o ya fue usado.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
        <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-bone-50 group-hover:bg-teal-800 transition-colors">
          <Brain size={18} strokeWidth={2.5} />
        </div>
        <span className="font-display text-xl tracking-tightest font-medium">NeuroAlert</span>
      </Link>

      {done ? (
        <div className="animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 mb-6">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="font-display text-4xl tracking-tightest mb-2">Contraseña actualizada</h1>
          <p className="text-ink-mute mb-8">
            Por seguridad cerramos tus otras sesiones. Te llevamos a iniciar sesión…
          </p>
          <Link href="/login" className="btn-primary px-8 py-3.5 text-base">
            Iniciar sesión
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-4xl tracking-tightest mb-2">Nueva contraseña</h1>
          <p className="text-ink-mute mb-8">
            Elige una contraseña de al menos {MIN_PASSWORD} caracteres. Al guardarla, se cerrarán
            tus sesiones activas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="label">Nueva contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input pr-11"
                  placeholder="Mínimo 12 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-fade hover:text-teal-700"
                  aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="label">Repite la contraseña</label>
              <input
                id="confirm"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                className="input"
                placeholder="Vuelve a escribirla"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-800">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base">
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Guardar contraseña
                </>
              )}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 text-sm text-teal-700 font-medium hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center p-8 md:p-16 bg-bone-50">
        <Suspense
          fallback={
            <div className="max-w-md w-full mx-auto">
              <Loader2 size={32} className="animate-spin text-teal-700" />
            </div>
          }
        >
          <ResetPasswordInner />
        </Suspense>
      </div>

      <AuthAside
        quote={'"Recuperar tu acceso debe ser seguro y simple."'}
        caption="Reseteo con token de un solo uso · expira en 15 minutos"
      />
    </main>
  );
}
