// ============================================================================
// Skeleton — placeholder de carga con shimmer de marca
// ============================================================================
// La animación vive en globals.css (.skeleton). Aquí solo se componen formas.
// `SkeletonCard` imita la tarjeta de una consulta para que la carga "encaje"
// con el contenido que llega después (sin salto de layout).
// ============================================================================

import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

export function SkeletonCard() {
  return (
    <div className="card" aria-hidden="true">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-24 rounded-xl" />
        <Skeleton className="h-7 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Cargando…">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
