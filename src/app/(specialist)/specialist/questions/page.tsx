'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Loader2, MessageCircle, Lock } from 'lucide-react';

import { apiGet, apiPost } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';

const answerSchema = z.object({
  body: z.string().min(20, 'Tu respuesta debe ser más detallada').max(5000),
});

type AnswerForm = z.infer<typeof answerSchema>;

interface Question {
  id: string;
  title: string;
  body: string;
  status: 'OPEN' | 'ASSIGNED' | 'ANSWERED' | 'CLOSED';
  isUrgent: boolean;
  isAnonymous: boolean;
  childAgeMonths: number | null;
  createdAt: string;
  author: { fullName: string };
  assignedTo: { fullName: string } | null;
  answers: { id: string }[];
}

// Detalle (GET /questions/:id) — trae el hilo COMPLETO de respuestas con su hora.
interface AnswerDetail {
  id: string;
  body: string;
  isAccepted: boolean;
  createdAt: string;
  specialist: {
    id: string;
    fullName: string;
    specialistProfile?: { specialty?: string; institution?: string | null } | null;
  };
}

interface QuestionDetail extends Omit<Question, 'answers'> {
  answers: AnswerDetail[];
}

type FilterTab = 'open' | 'mine' | 'all';

export default function SpecialistQuestionsPage() {
  const [tab, setTab] = useState<FilterTab>('open');

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ['specialist-questions-all'],
    queryFn: () => apiGet<Question[]>('/questions'),
  });

  const filtered = (questions || []).filter((q) => {
    if (tab === 'open') return q.status === 'OPEN';
    if (tab === 'mine') return q.status === 'ASSIGNED' || q.status === 'ANSWERED';
    return true;
  });

  return (
    <div className="container-wide py-12">
      <span className="text-xs font-mono uppercase tracking-widest text-coral-700">
        Bandeja
      </span>
      <h1 className="font-display text-4xl tracking-tightest mt-2 mb-2">
        Consultas de padres
      </h1>
      <p className="text-ink-mute mb-8">
        Toma una consulta para responderla. Tus respuestas son visibles para todos los padres
        verificados como acreditadas.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-bone-200">
        <TabButton active={tab === 'open'} onClick={() => setTab('open')}>
          Sin asignar ({(questions || []).filter((q) => q.status === 'OPEN').length})
        </TabButton>
        <TabButton active={tab === 'mine'} onClick={() => setTab('mine')}>
          En mis manos
        </TabButton>
        <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
          Todas
        </TabButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-teal-700" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <MessageCircle size={28} className="mx-auto text-teal-300 mb-2" />
          <p className="text-ink-mute text-sm">No hay consultas en esta bandeja.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? 'border-teal-700 text-teal-700' : 'border-transparent text-ink-mute hover:text-ink-soft'
      }`}
    >
      {children}
    </button>
  );
}

function QuestionCard({ question }: { question: Question }) {
  const [expanded, setExpanded] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const queryClient = useQueryClient();

  // Hilo completo de respuestas (con su hora). Se trae al expandir o al responder.
  const { data: detail, isLoading: detailLoading } = useQuery<QuestionDetail>({
    queryKey: ['question-detail', question.id],
    queryFn: () => apiGet<QuestionDetail>(`/questions/${question.id}`),
    enabled: expanded || showAnswerForm,
  });
  const answers = detail?.answers ?? [];

  const assignMutation = useMutation({
    mutationFn: () => apiPost(`/questions/${question.id}/assign-to-me`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['specialist-questions-all'] }),
  });

  const answerMutation = useMutation({
    mutationFn: (payload: AnswerForm) => apiPost(`/questions/${question.id}/answer`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-questions-all'] });
      // Refresca el hilo para que la respuesta recién enviada (con su hora) aparezca.
      queryClient.invalidateQueries({ queryKey: ['question-detail', question.id] });
      reset();
      setShowAnswerForm(false);
      setExpanded(true); // mantener visible el historial actualizado
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnswerForm>({ resolver: zodResolver(answerSchema) });

  // Abrir el formulario también muestra el historial (el especialista ve qué ya respondió).
  function toggleAnswerForm() {
    setShowAnswerForm((s) => {
      const next = !s;
      if (next) setExpanded(true);
      return next;
    });
  }

  const statusBadge = {
    OPEN: { label: 'Esperando especialista', color: 'bg-amber-100 text-amber-800' },
    ASSIGNED: { label: 'En revisión', color: 'bg-teal-100 text-teal-800' },
    ANSWERED: { label: 'Respondida', color: 'bg-teal-200 text-teal-900' },
    CLOSED: { label: 'Cerrada', color: 'bg-bone-200 text-ink-mute' },
  }[question.status];

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${statusBadge.color}`}>{statusBadge.label}</span>
          {question.isUrgent && (
            <span className="badge bg-coral-100 text-coral-800">Urgente</span>
          )}
          {question.isAnonymous && (
            <span className="badge bg-bone-200 text-ink-mute inline-flex items-center gap-1">
              <Lock size={11} /> Anónima
            </span>
          )}
        </div>
        <span className="text-xs text-ink-fade flex-shrink-0 inline-flex items-center gap-1">
          <Clock size={11} /> {formatDateTime(question.createdAt)}
        </span>
      </div>

      <h3 className="font-display text-lg leading-tight mb-2">{question.title}</h3>

      <div className="text-sm text-ink-mute mb-3">
        {question.author.fullName}
        {question.childAgeMonths != null && ` · niño/a de ${question.childAgeMonths} meses`}
      </div>

      {expanded && (
        <>
          <p className="text-sm text-ink-soft whitespace-pre-line mt-3 mb-4 p-4 bg-bone-50 rounded-xl">
            {question.body}
          </p>

          {/* Historial de respuestas (con fecha y hora) */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={14} className="text-teal-700" />
              <span className="text-xs font-medium uppercase tracking-wider text-ink-mute">
                {answers.length === 0
                  ? 'Sin respuestas aún'
                  : `Historial de respuestas (${answers.length})`}
              </span>
            </div>

            {detailLoading && answers.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-ink-fade py-2">
                <Loader2 size={13} className="animate-spin" /> Cargando historial…
              </div>
            ) : (
              <div className="space-y-2">
                {answers.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border text-sm ${
                      a.isAccepted
                        ? 'border-teal-300 bg-teal-50/60'
                        : 'border-bone-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="font-medium text-ink-soft">
                        {a.specialist.fullName}
                        {a.specialist.specialistProfile?.specialty && (
                          <span className="font-normal text-ink-fade">
                            {' · '}
                            {a.specialist.specialistProfile.specialty}
                          </span>
                        )}
                      </span>
                      <span className="text-2xs text-ink-fade inline-flex items-center gap-1 flex-shrink-0">
                        <Clock size={10} /> {formatDateTime(a.createdAt)}
                      </span>
                    </div>
                    <p className="text-ink-soft whitespace-pre-line leading-relaxed">{a.body}</p>
                    {a.isAccepted && (
                      <span className="mt-2 inline-flex items-center gap-1 text-2xs text-teal-700 font-medium">
                        <CheckCircle2 size={11} /> Aceptada por el padre
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="btn-ghost text-xs px-3 py-1.5"
        >
          {expanded ? <><ChevronUp size={14} /> Ocultar</> : <><ChevronDown size={14} /> Ver detalles</>}
        </button>

        {question.status === 'OPEN' && (
          <button
            onClick={() => assignMutation.mutate()}
            disabled={assignMutation.isPending}
            className="btn-primary text-xs px-3 py-1.5"
          >
            {assignMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Tomar consulta'}
          </button>
        )}

        {(question.status === 'ASSIGNED' || question.status === 'ANSWERED') && (
          <button
            onClick={toggleAnswerForm}
            className="btn-coral text-xs px-3 py-1.5"
          >
            {showAnswerForm ? 'Cancelar' : question.answers.length === 0 ? 'Responder' : 'Añadir respuesta'}
          </button>
        )}
      </div>

      {showAnswerForm && (
        <form
          onSubmit={handleSubmit((v) => answerMutation.mutate(v))}
          className="mt-5 pt-5 border-t border-bone-200 animate-fade-in"
          noValidate
        >
          <label className="label">Tu respuesta clínica</label>
          <textarea
            rows={6}
            placeholder="Sé claro, empático y orientativo. Recuerda que esto NO es un diagnóstico."
            className="input resize-y"
            {...register('body')}
          />
          {errors.body && <p className="text-xs text-coral-600 mt-1">{errors.body.message}</p>}

          <div className="flex gap-2 mt-3">
            <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> Enviar respuesta</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
