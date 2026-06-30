// ============================================================================
// Route transition (template.tsx)
// ============================================================================
// A diferencia de layout.tsx, template.tsx se RE-MONTA en cada navegación, así
// que la animación CSS de entrada se reproduce en cada cambio de ruta. Es CSS
// puro (no depende de JS para terminar visible) y respeta prefers-reduced-motion
// — mismo criterio que el NeuroLoader. No lleva 'use client': los hijos siguen
// siendo server components y las páginas estáticas se mantienen estáticas.
// ============================================================================

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-transition">{children}</div>;
}
