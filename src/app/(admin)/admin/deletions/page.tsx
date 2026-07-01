'use client';

// ============================================================================
// /admin/deletions — cola de SOLICITUDES DE BAJA de especialistas (Etapa 3)
// ============================================================================
// El admin revisa cada solicitud. Al aprobar, la cuenta pasa a INACTIVE (no se
// borra; artículos/historial se conservan). Rechazo con nota opcional.
// ============================================================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, LogOut, ShieldCheck, XCircle } from 'lucide-react';

import { apiGet, apiPatch } from '@/lib/api-client';

interface LeaveRequest {
  id: string;
  reason: string;
  comments: string | null;
  createdAt: string;
  user: { id: string; email: string; fullName: string; role: string; createdAt: string };
}

export default function AdminDeletionsPage() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ['admin-leave-requests'],
    queryFn: () => apiGet<LeaveRequest[]>('/users/admin/leave-requests'),
  });

  const decide = useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) =>
      apiPatch(`/users/admin/leave-requests/${id}/${action}`, { note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-leave-requests'] }),
  });

  return (
    <div className="container-wide py-12">
      <span className="text-xs font-mono uppercase tracking-widest text-coral-700">
        Bajas de especialistas
      </span>
      <h1 className="font-display text-4xl tracking-tightest mt-2 mb-2">Solicitudes de baja</h1>
      <p className="text-ink-mute mb-8 max-w-xl">
        Al aprobar, la cuenta pasa a <strong>inactiva</strong> (no se elimina): sus artículos,
        historial y auditoría se conservan. Puedes reactivarla luego desde Usuarios.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-teal-700" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="card text-center py-12">
          <ShieldCheck size={28} className="mx-auto text-teal-300 mb-2" />
          <p className="text-ink-mute text-sm">No hay solicitudes de baja pendientes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-display text-xl mb-0.5">{r.user.fullName}</h3>
                  <div className="text-sm text-ink-mute">{r.user.email}</div>
                  <div className="text-xs text-ink-fade mt-1">
                    Solicitada el {new Date(r.createdAt).toLocaleDateString('es-PE')}
                  </div>
                </div>
                <span className="badge bg-amber-100 text-amber-800">
                  <LogOut size={12} /> Baja pendiente
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-fade font-mono">Motivo</div>
                  <div className="font-medium text-sm">{r.reason}</div>
                </div>
                {r.comments && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink-fade font-mono">Comentarios</div>
                    <div className="text-sm text-ink-soft">{r.comments}</div>
                  </div>
                )}
              </div>

              <div className="border-t border-bone-200 pt-4">
                <input
                  type="text"
                  className="input mb-3"
                  placeholder="Nota de decisión (opcional)"
                  value={notes[r.id] ?? ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => decide.mutate({ id: r.id, action: 'approve', note: notes[r.id] })}
                    disabled={decide.isPending}
                    className="btn-primary text-sm"
                  >
                    {decide.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={14} /> Aprobar baja
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => decide.mutate({ id: r.id, action: 'reject', note: notes[r.id] })}
                    disabled={decide.isPending}
                    className="btn-secondary text-sm"
                  >
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
