'use client';

// ============================================================================
// /specialist/cuenta — "Mi cuenta" del ESPECIALISTA (Etapa 3: solicitar baja)
// ============================================================================
// El especialista NO elimina su cuenta directamente: SOLICITA la baja. Entra a
// una cola del admin. Sus artículos, historial y auditoría se conservan.
// ============================================================================

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Loader2, LogOut, ShieldAlert } from 'lucide-react';

import { apiPost } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { InstitutionalEmail } from '@/components/institutional-email';

const REASONS = [
  'Finalización de colaboración',
  'Falta de tiempo',
  'Motivos personales',
  'Otro',
];

export default function SpecialistAccountPage() {
  const { user } = useAuth();
  const [reason, setReason] = useState(REASONS[0]);
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const leaveMutation = useMutation({
    mutationFn: () => apiPost('/users/me/request-leave', { reason, comments: comments || undefined }),
    onSuccess: () => setDone(true),
    onError: (e: unknown) => setError(extractError(e)),
  });

  return (
    <div className="container-narrow py-12">
      <span className="text-xs font-mono uppercase tracking-widest text-coral-700">Mi cuenta</span>
      <h1 className="font-display text-4xl tracking-tightest mt-2 mb-8">Configuración de la cuenta</h1>

      <div className="card mb-6">
        <div className="text-xs uppercase tracking-wider text-ink-fade font-mono mb-1">Nombre</div>
        <div className="font-medium mb-4">{user?.fullName}</div>
        <div className="text-xs uppercase tracking-wider text-ink-fade font-mono mb-1">Correo (login)</div>
        <div className="font-medium mb-4">{user?.email}</div>
        <InstitutionalEmail fullName={user?.fullName} />
      </div>

      <div className="card border-coral-200">
        <div className="flex items-start gap-3">
          <ShieldAlert size={22} className="text-coral-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="font-display text-xl mb-1">Solicitar baja como especialista</h2>
            <p className="text-sm text-ink-mute mb-5">
              Como especialista no eliminas tu cuenta directamente: solicitas la baja y un
              administrador la revisa. Tus artículos publicados y tu historial se conservan.
            </p>

            {done ? (
              <div className="rounded-xl bg-teal-50 border border-teal-200 p-5 text-center">
                <CheckCircle2 className="mx-auto text-teal-700 mb-2" size={32} />
                <h3 className="font-display text-lg mb-1">Solicitud enviada</h3>
                <p className="text-sm text-ink-soft">
                  Un administrador revisará tu solicitud de baja. Te avisaremos de la decisión.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="label">Motivo</label>
                  <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
                    {REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Comentarios (opcional)</label>
                  <textarea
                    className="input min-h-[90px] resize-y"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Cuéntanos más si lo deseas"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-800">
                    {error}
                  </div>
                )}

                <button
                  onClick={() => {
                    setError(null);
                    leaveMutation.mutate();
                  }}
                  disabled={leaveMutation.isPending}
                  className="btn-coral text-sm"
                >
                  {leaveMutation.isPending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <LogOut size={15} /> Solicitar baja
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function extractError(e: unknown): string {
  const err = e as { response?: { data?: { message?: string | string[] } } };
  const msg = err.response?.data?.message;
  return Array.isArray(msg) ? msg.join(' · ') : msg || 'No se pudo completar la acción.';
}
