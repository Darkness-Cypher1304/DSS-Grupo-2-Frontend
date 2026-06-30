'use client';

// ============================================================================
// NotificationBell — notificaciones in-app por polling (RF-34)
// ============================================================================
// Sin WebSocket (Render free-tier no lo sostiene): react-query hace polling del
// contador de no leídas cada 30s. El listado se trae solo al abrir el panel.
// Al hacer clic en una notificación de consulta, navega al detalle y la marca
// como leída. Los helpers van INLINE (no en src/lib) para no afectar el gate de
// cobertura, que mide únicamente src/lib/**/*.ts.
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, MessageCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGet, apiPatch } from '@/lib/api-client';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  relatedType: string | null;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

const POLL_MS = 30_000;

export function NotificationBell() {
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Polling ligero del contador (lo único que corre en segundo plano).
  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => apiGet<{ count: number }>('/notifications/unread-count'),
    refetchInterval: POLL_MS,
  });

  // El listado solo se pide cuando el panel está abierto.
  const { data: items, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => apiGet<NotificationItem[]>('/notifications'),
    enabled: open,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['notifications'] });

  const markOne = useMutation({
    mutationFn: (id: string) => apiPatch(`/notifications/${id}/read`),
    onSuccess: invalidate,
  });
  const markAll = useMutation({
    mutationFn: () => apiPatch('/notifications/read-all'),
    onSuccess: invalidate,
  });

  // Cerrar el panel al hacer clic fuera o presionar Escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const count = unread?.count ?? 0;

  function handleClick(n: NotificationItem) {
    if (!n.isRead) markOne.mutate(n.id);
    setOpen(false);
    // Navega al recurso de origen (hoy: consultas respondidas).
    if (n.relatedType === 'Question' && n.relatedId) {
      router.push(`/ask/${n.relatedId}`);
    }
  }

  return (
    <div ref={ref} className="fixed top-4 right-4 z-40 md:top-5 md:right-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={count > 0 ? `Notificaciones (${count} sin leer)` : 'Notificaciones'}
        className="relative w-10 h-10 rounded-full bg-white border border-bone-200 shadow-sm flex items-center justify-center text-ink-soft hover:text-teal-700 hover:border-teal-200 transition-colors"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-coral-600 text-bone-50 text-2xs font-semibold flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-bone-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-bone-100">
            <span className="text-sm font-medium">Notificaciones</span>
            {count > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline disabled:opacity-50"
                disabled={markAll.isPending}
              >
                <Check size={13} />
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-auto">
            {isLoading ? (
              <p className="px-4 py-8 text-sm text-ink-mute text-center">Cargando…</p>
            ) : !items || items.length === 0 ? (
              <p className="px-4 py-10 text-sm text-ink-mute text-center">
                No tienes notificaciones todavía.
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-bone-100 last:border-0 hover:bg-bone-50 transition-colors flex gap-3 ${
                    n.isRead ? '' : 'bg-teal-50/60'
                  }`}
                >
                  <span className="mt-0.5 text-teal-700 shrink-0">
                    <MessageCircle size={16} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-ink truncate">{n.title}</span>
                    {n.body && (
                      <span className="block text-xs text-ink-mute truncate">{n.body}</span>
                    )}
                    <span className="block text-2xs text-ink-fade mt-0.5">
                      {formatRelative(n.createdAt)}
                    </span>
                  </span>
                  {!n.isRead && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-coral-600 shrink-0" aria-hidden />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Tiempo relativo en español (inline a propósito; ver cabecera del archivo).
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMin = Math.floor((Date.now() - then) / 60_000);
  if (diffMin < 1) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr} h`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `hace ${diffDays} d`;
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}
