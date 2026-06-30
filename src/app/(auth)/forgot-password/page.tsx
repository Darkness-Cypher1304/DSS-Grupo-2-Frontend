'use client';

// ============================================================================
// /forgot-password — solicitud de reseteo de contraseña (RF-06)
// ============================================================================
// Llama a POST /auth/forgot-password. Por seguridad (OWASP A07) el backend
// responde SIEMPRE con un mensaje genérico, exista o no la cuenta, para no
// revelar qué correos están registrados. El enlace llega por correo y aterriza
// en /reset-password.
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { Brain, ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';

import { apiPost } from '@/lib/api-client';
import { AuthAside } from '@/components/auth-aside';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost<{ message: string }>('/auth/forgot-password', { email });
      // Respuesta siempre genérica: no confirmamos ni negamos que el correo exista.
      setSent(true);
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'No pudimos procesar la solicitud. Inténtalo de nuevo en un momento.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Lado izquierdo: contenido */}
      <div className="flex flex-col justify-center p-8 md:p-16 bg-bone-50">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-bone-50 group-hover:bg-teal-800 transition-colors">
              <Brain size={18} strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl tracking-tightest font-medium">NeuroAlert</span>
          </Link>

          {sent ? (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 mb-6">
                <CheckCircle2 size={26} />
              </div>
              <h1 className="font-display text-4xl tracking-tightest mb-2">Revisa tu correo</h1>
              <p className="text-ink-mute mb-8">
                Si <strong>{email}</strong> corresponde a una cuenta registrada, te enviamos un
                enlace para crear una nueva contraseña. El enlace expira en 15 minutos.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-teal-700 font-medium hover:underline"
              >
                <ArrowLeft size={16} />
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-4xl tracking-tightest mb-2">Recuperar acceso</h1>
              <p className="text-ink-mute mb-8">
                Ingresa el correo de tu cuenta y te enviaremos un enlace seguro para restablecer
                tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="label">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Enviar enlace de recuperación
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-ink-fade mt-5">
                Por tu seguridad, no revelamos si un correo está registrado. Si la cuenta existe,
                el enlace llegará a tu bandeja.
              </p>

              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-2 text-sm text-teal-700 font-medium hover:underline"
              >
                <ArrowLeft size={16} />
                Volver a iniciar sesión
              </Link>
            </>
          )}
        </div>
      </div>

      <AuthAside
        quote={'"Proteger los datos de cada familia es parte del cuidado."'}
        caption="Recuperación verificada · enlace de un solo uso"
      />
    </main>
  );
}
