'use client';

// ============================================================================
// Motion — piezas de movimiento reutilizables del rediseño "Aurora Prisma"
// ============================================================================
// Presentacionales (sin lógica de negocio) y con DEGRADACIÓN GRÁCIL: el estado
// por defecto (sin JS / antes de hidratar) es VISIBLE / valor final, de modo que
// el contenido nunca queda invisible. El movimiento (ocultar → revelar, contar)
// es una MEJORA que solo se activa cuando el JS realmente corre, aplicada en un
// layout-effect para no producir parpadeo. Todo respeta prefers-reduced-motion.
// ============================================================================

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// useLayoutEffect en cliente, useEffect en SSR (evita el warning de React).
const useIsoLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Spotlight — resplandor radial que sigue el cursor dentro de su contenedor
// padre. Decorativo: sin JS queda como un resplandor tenue estático (inofensivo).
// ---------------------------------------------------------------------------
export function Spotlight({
  color = 'rgba(127, 233, 224, 0.16)',
  size = 620,
  className = '',
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent || prefersReduced()) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = parent.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
        el.style.opacity = '1';
      });
    };
    const onLeave = () => {
      el.style.opacity = '0';
    };
    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerleave', onLeave);
    return () => {
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        opacity: 0.35,
        transition: 'opacity 0.4s ease',
        background: `radial-gradient(${size}px circle at var(--mx, 50%) var(--my, 12%), ${color}, transparent 62%)`,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Reveal — desliza + funde el contenido al entrar en viewport (una sola vez).
// Por defecto VISIBLE; solo se oculta-para-revelar si el JS corre.
// ---------------------------------------------------------------------------
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true); // visible por defecto (robusto sin JS)

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;

    setShown(false); // armar (antes del paint → sin parpadeo)
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setShown(true);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    // Salvaguarda: si el observer nunca dispara, el contenido se muestra igual.
    const fallback = window.setTimeout(reveal, 1600);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(26px)',
        transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CountUp — anima un número de 0 al valor al entrar en viewport.
// Por defecto muestra el valor FINAL (robusto sin JS); si el JS corre, arranca
// en 0 y anima.
// ---------------------------------------------------------------------------
export function CountUp({
  to,
  decimals = 0,
  duration = 1300,
  className = '',
}: {
  to: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to); // valor final por defecto (robusto)

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;

    setValue(0); // armar
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      let start: number | null = null;
      const step = (t: number) => {
        if (start === null) start = t;
        const k = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        setValue(to * eased);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    const fallback = window.setTimeout(run, 1600);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(decimals)}
    </span>
  );
}
