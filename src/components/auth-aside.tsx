// ============================================================================
// AuthAside — panel editorial lateral (lado derecho) de las páginas de auth
// ============================================================================
// Server component reutilizable que replica el panel de marca de /login y
// /forgot-password, parametrizable por cita/leyenda. Evita duplicar el bloque
// en verify-email, reset-password y forgot-password.
// ============================================================================

interface AuthAsideProps {
  eyebrow?: string;
  quote: string;
  caption: string;
  footer?: string;
}

export function AuthAside({
  eyebrow = 'NeuroAlert · Seguridad',
  quote,
  caption,
  footer = 'Tus datos están cifrados y auditados.',
}: AuthAsideProps) {
  return (
    <div className="hidden lg:flex relative bg-gradient-to-br from-teal-800 via-teal-900 to-teal-950 text-bone-50 overflow-hidden">
      <div className="absolute inset-0 grain-overlay opacity-50" />
      <div className="relative z-10 flex flex-col justify-between p-16 w-full">
        <div className="text-xs font-mono uppercase tracking-widest text-teal-300">{eyebrow}</div>

        <div>
          <p className="font-display text-4xl leading-tight mb-6">{quote}</p>
          <div className="text-sm text-teal-200">{caption}</div>
        </div>

        <div className="text-sm text-teal-300">{footer}</div>
      </div>
    </div>
  );
}

export default AuthAside;
