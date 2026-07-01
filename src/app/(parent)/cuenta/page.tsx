'use client';

// ============================================================================
// /cuenta — "Mi cuenta" del PADRE (Etapa 3: autoeliminación)
// ============================================================================
// El padre puede eliminar su cuenta: modal con contraseña + escribir "ELIMINAR".
// Entra en período de gracia (PENDING_DELETION) y puede cancelar. Tras el submit
// se cierran las sesiones → se hace logout local.
// ============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AlertTriangle, Loader2, ShieldAlert, Trash2, X, RotateCcw } from 'lucide-react';

import { apiGet, apiPost } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

interface MeProfile {
  id: string;
  email: string;
  fullName: string;
  status: string;
  deletionRequestedAt: string | null;
}

export default function ParentAccountPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmWord, setConfirmWord] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: me, isLoading, refetch } = useQuery<MeProfile>({
    queryKey: ['me-account'],
    queryFn: () => apiGet<MeProfile>('/users/me'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiPost('/users/me/request-deletion', { password, reason: reason || undefined }),
    onSuccess: async () => {
      // El backend revocó las sesiones → cerramos sesión local y vamos al inicio.
      await logout().catch(() => undefined);
      router.push('/?bye=1');
    },
    onError: (e: unknown) => setError(extractError(e)),
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiPost('/users/me/cancel-deletion', {}),
    onSuccess: () => refetch(),
  });

  const pending = me?.status === 'PENDING_DELETION';

  return (
    <div className="container-narrow py-12">
      <span className="text-xs font-mono uppercase tracking-widest text-coral-700">Mi cuenta</span>
      <h1 className="font-display text-4xl tracking-tightest mt-2 mb-8">Configuración de la cuenta</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={26} className="animate-spin text-teal-700" />
        </div>
      ) : (
        <>
          <div className="card mb-6">
            <div className="text-xs uppercase tracking-wider text-ink-fade font-mono mb-1">Nombre</div>
            <div className="font-medium mb-4">{me?.fullName}</div>
            <div className="text-xs uppercase tracking-wider text-ink-fade font-mono mb-1">Correo</div>
            <div className="font-medium">{me?.email}</div>
          </div>

          {pending ? (
            <div className="card border-amber-200 bg-amber-50/60">
              <div className="flex items-start gap-3">
                <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h2 className="font-display text-xl mb-1">Tu cuenta está programada para eliminación</h2>
                  <p className="text-sm text-ink-soft mb-4">
                    Solicitaste eliminar tu cuenta
                    {me?.deletionRequestedAt
                      ? ` el ${new Date(me.deletionRequestedAt).toLocaleDateString('es-PE')}`
                      : ''}
                    . Durante el período de gracia puedes cancelar y conservar tu cuenta y tus datos.
                  </p>
                  <button
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="btn-primary text-sm"
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        <RotateCcw size={15} /> Cancelar eliminación
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-coral-200">
              <div className="flex items-start gap-3">
                <ShieldAlert size={22} className="text-coral-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h2 className="font-display text-xl mb-1">Eliminar mi cuenta</h2>
                  <p className="text-sm text-ink-mute mb-4">
                    Tu cuenta entrará en un período de gracia y luego se anonimizará. Tus evaluaciones
                    se conservan de forma anónima. Podrás cancelar durante la gracia.
                  </p>
                  <button onClick={() => setModalOpen(true)} className="btn-coral text-sm">
                    <Trash2 size={15} /> Eliminar mi cuenta
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display text-2xl">¿Eliminar tu cuenta?</h3>
              <button onClick={() => setModalOpen(false)} className="text-ink-mute hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-ink-mute mb-5">
              Esta acción inicia la eliminación de tu cuenta. Para confirmar, ingresa tu contraseña y
              escribe <strong>ELIMINAR</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="label">Contraseña</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                />
              </div>
              <div>
                <label className="label">Escribe ELIMINAR para confirmar</label>
                <input
                  type="text"
                  className="input"
                  value={confirmWord}
                  onChange={(e) => setConfirmWord(e.target.value)}
                  placeholder="ELIMINAR"
                />
              </div>
              <div>
                <label className="label">Motivo (opcional)</label>
                <input
                  type="text"
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nos ayuda a mejorar"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-800">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setModalOpen(false)} className="btn-ghost text-sm">
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    deleteMutation.mutate();
                  }}
                  disabled={!password || confirmWord !== 'ELIMINAR' || deleteMutation.isPending}
                  className="btn-coral text-sm"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    'Eliminar definitivamente'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function extractError(e: unknown): string {
  const err = e as { response?: { data?: { message?: string | string[] } } };
  const msg = err.response?.data?.message;
  return Array.isArray(msg) ? msg.join(' · ') : msg || 'No se pudo completar la acción.';
}
