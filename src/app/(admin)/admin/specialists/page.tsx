'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileText, Loader2, ShieldCheck, X, XCircle } from 'lucide-react';

import { api, apiGet, apiPatch } from '@/lib/api-client';

interface PendingSpecialist {
  id: string;
  licenseNumber: string;
  specialty: string;
  institution: string | null;
  yearsOfExperience: number;
  bio: string | null;
  licenseDocumentKey: string | null;
  cvDocumentKey: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string | null;
    createdAt: string;
  };
}

export default function AdminSpecialistsPage() {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [docError, setDocError] = useState<string | null>(null);

  // Descarga autenticada: el endpoint /storage/:id exige el Bearer (en memoria),
  // así que pedimos el blob por axios y lo abrimos con un object URL temporal.
  async function openDoc(id: string) {
    setDocError(null);
    try {
      const res = await api.get(`/storage/${id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setDocError('No se pudo abrir el documento.');
    }
  }

  const { data, isLoading } = useQuery<PendingSpecialist[]>({
    queryKey: ['admin-pending-specialists'],
    queryFn: () => apiGet<PendingSpecialist[]>('/users/admin/specialists/pending'),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, decision, reason }: { id: string; decision: 'APPROVED' | 'REJECTED'; reason?: string }) =>
      apiPatch(`/users/admin/specialists/${id}/verify`, { decision, rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-specialists'] });
      setRejecting(null);
      setRejectReason('');
    },
  });

  return (
    <div className="container-wide py-12">
      <span className="text-xs font-mono uppercase tracking-widest text-coral-700">
        Verificación de credenciales
      </span>
      <h1 className="font-display text-4xl tracking-tightest mt-2 mb-2">
        Especialistas por verificar
      </h1>
      <p className="text-ink-mute mb-8 max-w-xl">
        Solicitudes de <strong>upgrade</strong>: usuarios que <strong>ya tienen cuenta</strong> (p. ej.
        apoderados) y pidieron ser especialistas desde su perfil. Las postulaciones de personas
        <strong> sin cuenta</strong> se revisan en <strong>“Postulaciones”</strong>. Verifica la
        colegiatura en el sitio del CMP/CPsP antes de aprobar.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-teal-700" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="card text-center py-12">
          <ShieldCheck size={28} className="mx-auto text-teal-300 mb-2" />
          <p className="text-ink-mute text-sm">No hay solicitudes pendientes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((s) => (
            <div key={s.id} className="card">
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h3 className="font-display text-xl mb-1">{s.user.fullName}</h3>
                  <div className="text-sm text-ink-mute">{s.user.email}</div>
                  {s.user.phoneNumber && (
                    <div className="text-xs text-ink-fade mt-1">{s.user.phoneNumber}</div>
                  )}
                  <div className="text-xs text-ink-fade mt-2">
                    Solicitud: {new Date(s.createdAt).toLocaleDateString('es-PE')}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink-fade font-mono">Colegiatura</div>
                    <div className="font-medium">{s.licenseNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink-fade font-mono">Especialidad</div>
                    <div className="font-medium">{s.specialty}</div>
                  </div>
                  {s.institution && (
                    <div className="col-span-2">
                      <div className="text-xs uppercase tracking-wider text-ink-fade font-mono">Institución</div>
                      <div className="font-medium">{s.institution}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink-fade font-mono">Experiencia</div>
                    <div className="font-medium">{s.yearsOfExperience} años</div>
                  </div>
                </div>
              </div>

              {s.bio && (
                <div className="mb-4 p-4 bg-bone-50 rounded-xl">
                  <div className="text-xs uppercase tracking-wider text-ink-fade font-mono mb-2">Bio</div>
                  <p className="text-sm text-ink-soft">{s.bio}</p>
                </div>
              )}

              {/* Documentos de validación (RF-10 / descarga RF-28) */}
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wider text-ink-fade font-mono mb-2">
                  Documentos de validación
                </div>
                {s.licenseDocumentKey || s.cvDocumentKey ? (
                  <div className="flex flex-wrap gap-2">
                    {s.licenseDocumentKey && (
                      <button
                        type="button"
                        onClick={() => openDoc(s.licenseDocumentKey!)}
                        className="btn-secondary text-sm"
                      >
                        <FileText size={14} /> Ver licencia
                      </button>
                    )}
                    {s.cvDocumentKey && (
                      <button
                        type="button"
                        onClick={() => openDoc(s.cvDocumentKey!)}
                        className="btn-secondary text-sm"
                      >
                        <FileText size={14} /> Ver CV
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ink-fade">El solicitante no adjuntó documentos.</p>
                )}
                {docError && <p className="text-xs text-coral-600 mt-2">{docError}</p>}
              </div>

              {rejecting === s.id ? (
                <div className="border-t border-bone-200 pt-4">
                  <label className="label">Razón del rechazo</label>
                  <textarea
                    rows={2}
                    className="input resize-y"
                    placeholder="Ej: La colegiatura no aparece registrada en el CMP"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() =>
                        verifyMutation.mutate({ id: s.id, decision: 'REJECTED', reason: rejectReason })
                      }
                      disabled={verifyMutation.isPending || rejectReason.length < 10}
                      className="btn-coral text-sm"
                    >
                      Confirmar rechazo
                    </button>
                    <button
                      onClick={() => {
                        setRejecting(null);
                        setRejectReason('');
                      }}
                      className="btn-ghost text-sm"
                    >
                      <X size={14} />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 border-t border-bone-200 pt-4">
                  <button
                    onClick={() => verifyMutation.mutate({ id: s.id, decision: 'APPROVED' })}
                    disabled={verifyMutation.isPending}
                    className="btn-primary text-sm"
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={14} /> Aprobar
                      </>
                    )}
                  </button>
                  <button onClick={() => setRejecting(s.id)} className="btn-secondary text-sm">
                    <XCircle size={14} />
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
