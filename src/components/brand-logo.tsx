// ============================================================================
// BrandLogo — marca NeuroAlert (cerebro en cuadro redondeado)
// ============================================================================
// Fuente ÚNICA del logo para que sea idéntico y coherente en todo el sitio.
// Conserva el diseño base de siempre (icono Brain de lucide dentro de un cuadro
// redondeado teal); la evolución "Luz Clínica" solo lo refina a nivel visual:
// teal más profundo con un leve degradado y un aro interior sutil para dar
// profundidad y aire profesional. No cambia la imagen ni su significado.
// ============================================================================

import { Brain } from 'lucide-react';

type LogoSize = 'sm' | 'md' | 'lg';

const SIZES: Record<LogoSize, { box: string; icon: number; stroke: number; text: string }> = {
  sm: { box: 'w-7 h-7 rounded-lg', icon: 14, stroke: 2.5, text: 'text-base' },
  md: { box: 'w-9 h-9 rounded-xl', icon: 18, stroke: 2.5, text: 'text-xl' },
  lg: { box: 'w-11 h-11 rounded-2xl', icon: 22, stroke: 2.5, text: 'text-2xl' },
};

interface BrandLogoProps {
  /** Tamaño del glifo + wordmark. */
  size?: LogoSize;
  /** Mostrar el texto "NeuroAlert" junto al glifo (default: sí). */
  withWordmark?: boolean;
  /** Clases extra para el contenedor. */
  className?: string;
  /**
   * Si el logo vive sobre un fondo oscuro (panel teal), pone el wordmark en
   * hueso en vez de tinta. El glifo se ve igual sobre ambos fondos.
   */
  onDark?: boolean;
}

/**
 * Glifo aislado (cuadro con el cerebro), sin el wordmark. Útil en espacios
 * reducidos (avatares, favicons visuales, badges de marca).
 */
export function BrandGlyph({ size = 'md', className = '' }: { size?: LogoSize; className?: string }) {
  const s = SIZES[size];
  return (
    <span
      className={`${s.box} flex items-center justify-center bg-gradient-to-br from-teal-700 to-teal-900 text-bone-50 ring-1 ring-inset ring-white/10 shadow-sm transition-colors duration-200 ${className}`}
    >
      <Brain size={s.icon} strokeWidth={s.stroke} />
    </span>
  );
}

export function BrandLogo({ size = 'md', withWordmark = true, className = '', onDark = false }: BrandLogoProps) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandGlyph size={size} className="group-hover:from-teal-800 group-hover:to-teal-950" />
      {withWordmark && (
        <span className={`font-display ${s.text} tracking-tightest font-medium ${onDark ? 'text-bone-50' : 'text-ink'}`}>
          NeuroAlert
        </span>
      )}
    </span>
  );
}

export default BrandLogo;
