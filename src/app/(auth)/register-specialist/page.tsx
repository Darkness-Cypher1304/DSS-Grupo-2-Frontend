// ============================================================================
// /register-specialist — RETIRADO → redirige a /postular
// ============================================================================
// El especialista ya NO "se registra": POSTULA (no se crea cuenta hasta que un
// admin aprueba). Esta ruta se conserva solo para no romper enlaces antiguos y
// redirige de forma permanente al nuevo flujo de postulación (pantalla 9).
// ============================================================================

import { redirect } from 'next/navigation';

export default function RegisterSpecialistRedirect() {
  redirect('/postular');
}
