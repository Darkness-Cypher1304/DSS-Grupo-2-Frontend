'use client';

// ============================================================================
// /verify-email — landing del enlace de verificación de correo (RF-02)
// ============================================================================
// El backend envía un correo con enlace a /verify-email?token=... Esta página
// consume el token (POST /auth/verify-email) y muestra el resultado. Sin esta
// página el enlace de verificación daba 404.
// ============================================================================

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Brain, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

import { apiPost } from '@/lib/api-client';
import { AuthAside } from '@/components/auth-aside';

type Status = 'verifying' | 'success' | 'error';

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    // El token de verificación es de un solo uso → evitamos el doble disparo
    // del efecto en React StrictMode (dev), que consumiría el token dos veces.
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus('error');
      setMessage('El enlace de verificación es inválido o está incompleto.');
      return;
    }

    apiPost<{ message: string }>('/auth/verify-email', { token })
      .then((res) => {
        setStatus('success');
        setMessage(res?.message || 'Tu correo fue verificado correctamente.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'No pudimos verificar tu correo. El enlace pudo expirar o ya fue usado.',
        );
      });
  }, [token]);

  return (
    <div className="max-w-md w-full mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
        <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-bone-50 group-hover:bg-teal-800 transition-colors">
          <Brain size={18} strokeWidth={2.5} />
        </div>
        <span className="font-display text-xl tracking-tightest font-medium">NeuroAlert</span>
      </Link>

      {status === 'verifying' && (
        <div className="animate-fade-in">
          <Loader2 size={36} className="animate-spin text-teal-700 mb-6" />
          <h1 className="font-display text-4xl tracking-tightest mb-2">Verificando tu correo…</h1>
          <p className="text-ink-mute">Esto toma solo un momento.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 mb-6">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="font-display text-4xl tracking-tightest mb-2">¡Correo verificado!</h1>
          <p className="text-ink-mute mb-8">{message}</p>
          <Link href="/login" className="btn-primary px-8 py-3.5 text-base">
            Iniciar sesión
            <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-coral-50 flex items-center justify-center text-coral-700 mb-6">
            <XCircle size={26} />
          </div>
          <h1 className="font-display text-4xl tracking-tightest mb-2">No pudimos verificar</h1>
          <p className="text-ink-mute mb-8">{message}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary px-6 py-3 text-sm">
              Ir a iniciar sesión
            </Link>
            <Link href="/register" className="btn-secondary px-6 py-3 text-sm">
              Crear una cuenta
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <VerifyEmailInner />
        </Suspense>
      </div>

      <AuthAside
        eyebrow="NeuroAlert · Verificación"
        quote={'"Una cuenta verificada protege a cada familia."'}
        caption="Verificación de correo · token de un solo uso"
      />
    </main>
  );
}
