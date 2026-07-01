'use client';

// ============================================================================
// /admin/applications — PANTALLA 12: revisión de postulaciones de especialista
// ============================================================================
// Lista filtrable (Pendiente/Aprobada/Rechazada). Al revisar una postulación, el
// admin ve documentos y datos y DEBE completar un checklist de 6 ítems antes de
// habilitar "Aprobar especialista" (crea la cuenta + enlace de activación).
// ============================================================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  FileText,
  IdCard,
  Loader2,
  ShieldCheck,
  X,
  XCircle,
  ClipboardCheck,
} from 'lucide-react';

import { api, apiGet, apiPatch } from '@/lib/api-client';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

interface ApplicationSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  specialty: string;
  university: string;
  country: string;
  yearsOfExperience: number;
  status: Status;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

interface ApplicationDetail extends ApplicationSummary {
  linkedinUrl: string | null;
  availability: string;
  motivationLetter: string;
  cvFileId: string;
  dniFileId: string;
  cvSha256: string;
  dniSha256: string;
  submittedIp: string;
}

const CHECKLIST_ITEMS: { key: keyof ChecklistState; label: string }[] = [
  { key: 'dniValidated', label: 'DNI validado' },
  { key: 'cmpVerified', label: 'CMP / colegiatura verificada' },
  { key: 'cvReviewed', label: 'CV revisado' },
  { key: 'interviewDone', label: 'Entrevista realizada' },
  { key: 'documentsComplete', label: 'Documentos completos' },
  { key: 'noInconsistencies', label: 'Sin inconsistencias' },
];

interface ChecklistState {
  dniValidated: boolean;
  cmpVerified: boolean;
  cvReviewed: boolean;
  interviewDone: boolean;
  documentsComplete: boolean;
  noInconsistencies: boolean;
}

const EMPTY_CHECKLIST: ChecklistState = {
  dniValidated: false,
  cmpVerified: false,
  cvReviewed: false,
  interviewDone: false,
  documentsComplete: false,
  noInconsistencies: false,
};

const TABS: { value: Status; label: string }[] = [
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'APPROVED', label: 'Aprobadas' },
  { value: 'REJECTED', label: 'Rechazadas' },
];

export default function AdminApplicationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Status>('PENDING');
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<ApplicationSummary[]>({
    queryKey: ['admin-applications', tab],
    queryFn: () => apiGet<ApplicationSummary[]>(`/applications?status=${tab}`),
  });

  return (
    <div className="container-wide py-12">
      <span className="text-xs font-mono uppercase tracking-widest text-coral-700">
        Postulaciones de especialistas
      </span>
      <h1 className="font-display text-4xl tracking-tightest mt-2 mb-2">Solicitudes</h1>
      <p className="text-ink-mute mb-6 max-w-xl">
        Revisa cada postulación, verifica los documentos y completa el checklist antes de aprobar.
      </p>

      {/* Filtro por estado */}
      <div className="inline-flex rounded-xl border border-bone-200 bg-white p-1 mb-8">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setTab(t.value);
              setOpenId(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.value ? 'bg-teal-700 text-bone-50' : 'text-ink-mute hover:text-teal-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-teal-700" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="card text-center py-12">
          <ShieldCheck size={28} className="mx-auto text-teal-300 mb-2" />
          <p className="text-ink-mute text-sm">No hay postulaciones en este estado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((a) => (
            <ApplicationCard
              key={a.id}
              app={a}
              isOpen={openId === a.id}
              onToggle={() => setOpenId(openId === a.id ? null : a.id)}
              onDone={() => {
                queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
                setOpenId(null);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Tarjeta de postulación (summary + panel de revisión expandible)
// ----------------------------------------------------------------------------
function ApplicationCard({
  app,
  isOpen,
  onToggle,
  onDone,
}: {
  app: ApplicationSummary;
  isOpen: boolean;
  onToggle: () => void;
  onDone: () => void;
}) {
  const statusBadge =
    app.status === 'PENDING'
      ? 'badge bg-amber-100 text-amber-800'
      : app.status === 'APPROVED'
        ? 'badge bg-teal-100 text-teal-800'
        : 'badge bg-coral-100 text-coral-800';
  const statusLabel =
    app.status === 'PENDING' ? 'Pendiente' : app.status === 'APPROVED' ? 'Aprobada' : 'Rechazada';

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl mb-0.5">
            Dr(a). {app.firstName} {app.lastName}
          </h3>
          <div className="text-sm text-ink-mute">{app.email}</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-fade mt-2">
            <span>CMP: {app.licenseNumber}</span>
            <span>{app.specialty}</span>
            <span>{app.university}</span>
            <span>{app.yearsOfExperience} años</span>
            <span>{new Date(app.createdAt).toLocaleDateString('es-PE')}</span>
          </div>
        </div>
        <span className={statusBadge}>{statusLabel}</span>
      </div>

      {app.status !== 'PENDING' && app.rejectionReason && (
        <p className="mt-3 text-sm text-coral-800 bg-coral-50 border border-coral-100 rounded-xl px-4 py-2">
          Motivo: {app.rejectionReason}
        </p>
      )}

      {app.status === 'PENDING' && (
        <div className="border-t border-bone-200 mt-4 pt-4">
          <button onClick={onToggle} className="btn-secondary text-sm">
            <ClipboardCheck size={14} /> {isOpen ? 'Ocultar revisión' : 'Revisar y verificar'}
          </button>
          {isOpen && <ReviewPanel appId={app.id} onDone={onDone} />}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Panel de revisión: detalle + documentos + checklist + aprobar/rechazar
// ----------------------------------------------------------------------------
function ReviewPanel({ appId, onDone }: { appId: string; onDone: () => void }) {
  const [checklist, setChecklist] = useState<ChecklistState>(EMPTY_CHECKLIST);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [docError, setDocError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: detail, isLoading } = useQuery<ApplicationDetail>({
    queryKey: ['admin-application', appId],
    queryFn: () => apiGet<ApplicationDetail>(`/applications/${appId}`),
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const approveMutation = useMutation({
    mutationFn: () => apiPatch(`/applications/${appId}/approve`, { checklist }),
    onSuccess: onDone,
    onError: (e: unknown) => setActionError(extractError(e)),
  });

  const rejectMutation = useMutation({
    mutationFn: () => apiPatch(`/applications/${appId}/reject`, { rejectionReason: rejectReason }),
    onSuccess: onDone,
    onError: (e: unknown) => setActionError(extractError(e)),
  });

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

  if (isLoading || !detail) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={22} className="animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-5">
      {/* Datos completos */}
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <Info label="Teléfono" value={detail.phoneNumber} />
        <Info label="País" value={detail.country} />
        <Info label="Disponibilidad" value={detail.availability} />
        {detail.linkedinUrl && (
          <Info
            label="LinkedIn"
            value={
              <a href={detail.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline break-all">
                {detail.linkedinUrl}
              </a>
            }
          />
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-ink-fade font-mono mb-1">Carta de motivación</div>
        <p className="text-sm text-ink-soft bg-bone-50 rounded-xl p-4 whitespace-pre-wrap">
          {detail.motivationLetter}
        </p>
      </div>

      {/* Documentos + integridad */}
      <div>
        <div className="text-xs uppercase tracking-wider text-ink-fade font-mono mb-2">Documentos (huella SHA-256)</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => openDoc(detail.cvFileId)} className="btn-secondary text-sm">
            <FileText size={14} /> Ver CV
          </button>
          <button type="button" onClick={() => openDoc(detail.dniFileId)} className="btn-secondary text-sm">
            <IdCard size={14} /> Ver DNI
          </button>
        </div>
        <div className="text-2xs font-mono text-ink-fade mt-2 space-y-0.5 break-all">
          <div>CV: {detail.cvSha256}</div>
          <div>DNI: {detail.dniSha256}</div>
        </div>
        {docError && <p className="text-xs text-coral-600 mt-2">{docError}</p>}
      </div>

      {/* Checklist de verificación */}
      <div className="border border-bone-200 rounded-xl p-4">
        <div className="text-sm font-medium text-ink-soft mb-3">Checklist de verificación</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {CHECKLIST_ITEMS.map((item) => (
            <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-teal-700"
                checked={checklist[item.key]}
                onChange={(e) => setChecklist((c) => ({ ...c, [item.key]: e.target.checked }))}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-800">
          {actionError}
        </div>
      )}

      {/* Acciones */}
      {rejecting ? (
        <div>
          <label className="label">Motivo del rechazo</label>
          <textarea
            rows={2}
            className="input resize-y"
            placeholder="Ej: La colegiatura no aparece registrada en el CMP"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending || rejectReason.trim().length < 3}
              className="btn-coral text-sm"
            >
              {rejectMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar rechazo'}
            </button>
            <button onClick={() => setRejecting(false)} className="btn-ghost text-sm">
              <X size={14} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => approveMutation.mutate()}
            disabled={!allChecked || approveMutation.isPending}
            className="btn-primary text-sm"
            title={allChecked ? '' : 'Completa el checklist para aprobar'}
          >
            {approveMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={14} /> Aprobar especialista
              </>
            )}
          </button>
          <button onClick={() => setRejecting(true)} className="btn-secondary text-sm">
            <XCircle size={14} /> Rechazar
          </button>
          {!allChecked && (
            <span className="text-xs text-ink-fade">Marca los 6 ítems para habilitar la aprobación.</span>
          )}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-fade font-mono">{label}</div>
      <div className="font-medium text-ink-soft">{value}</div>
    </div>
  );
}

function extractError(e: unknown): string {
  const err = e as { response?: { data?: { message?: string | string[] } } };
  const msg = err.response?.data?.message;
  return Array.isArray(msg) ? msg.join(' · ') : msg || 'No se pudo completar la acción.';
}
