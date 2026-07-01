// ============================================================================
// InstitutionalEmail — alias institucional VISUAL del especialista (§8 prompt)
// ============================================================================
// Es SOLO una etiqueta decorativa: no es un buzón real, no recibe ni envía
// correos y NO sirve para iniciar sesión. El login y todo correo real siguen
// usando el correo real del especialista. El dominio da igual (no es operativo).
// Se genera en el cliente a partir del nombre; no se persiste ni toca el backend.
// El helper vive en un .tsx a propósito: la cobertura mide solo src/lib/**.
// ============================================================================

const INSTITUTIONAL_DOMAIN = 'especialistas.neuroalert.pe';

/** Genera `nombre.apellido@especialistas.neuroalert.pe` desde el nombre completo. */
export function institutionalAlias(fullName: string | undefined | null): string {
  const norm = (fullName || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita tildes/diacríticos
    .toLowerCase()
    .trim();
  const parts = norm.split(/\s+/).filter(Boolean);
  const first = parts[0] || 'especialista';
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  const local = (last ? `${first}.${last}` : first).replace(/[^a-z0-9.]/g, '');
  return `${local || 'especialista'}@${INSTITUTIONAL_DOMAIN}`;
}

export function InstitutionalEmail({
  fullName,
  className = '',
  compact = false,
}: {
  fullName: string | undefined | null;
  className?: string;
  compact?: boolean;
}) {
  const alias = institutionalAlias(fullName);

  if (compact) {
    return (
      <div className={className} title="Etiqueta visual — inicia sesión con tu correo real">
        <span className="text-[10px] uppercase tracking-widest text-ink-fade font-mono">
          Institucional
        </span>
        <div className="text-xs font-mono text-teal-700 truncate">{alias}</div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-teal-100 bg-teal-50/50 px-4 py-3 ${className}`}>
      <div className="text-[10px] uppercase tracking-widest text-ink-fade font-mono mb-0.5">
        Correo institucional
      </div>
      <div className="text-sm font-mono text-teal-700 break-all">{alias}</div>
      <div className="text-[11px] text-ink-fade mt-1">
        Etiqueta visual para tu perfil profesional. Inicia sesión y recibe correos con tu
        correo real.
      </div>
    </div>
  );
}

export default InstitutionalEmail;
