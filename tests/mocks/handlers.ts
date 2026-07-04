// ============================================================================
// MSW · Handlers por defecto de la API simulada
// ----------------------------------------------------------------------------
// Reproducen el contrato del backend: todas las respuestas van envueltas en
// `{ data: ... }` (TransformInterceptor). Estos son los handlers "ambientales"
// que cubren las llamadas que disparan los providers/layouts al montar (refresh
// de sesión, contador de notificaciones). Cada test sobrescribe lo que necesite
// con `server.use(...)`.
// ============================================================================
import { http, HttpResponse } from 'msw';

export const API = 'http://localhost:4000/api';

/** Envuelve como lo hace el backend: `{ data }`. */
export const wrap = <T>(data: T) => HttpResponse.json({ data });

export const handlers = [
  // Sin sesión activa por defecto → AuthProvider queda como invitado.
  http.post(`${API}/auth/refresh`, () => new HttpResponse(null, { status: 401 })),

  // Campana de notificaciones (polling): sin no-leídas por defecto.
  http.get(`${API}/notifications/unread-count`, () => wrap({ count: 0 })),
  http.get(`${API}/notifications`, () => wrap([])),

  // Endpoint de humo para validar la toolchain MSW ⇄ axios.
  http.get(`${API}/__smoke__`, () => wrap({ ok: true })),
];
