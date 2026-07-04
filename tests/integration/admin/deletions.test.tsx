import { describe, it, expect, jest } from '@jest/globals';
import { http } from 'msw';

import AdminDeletionsPage from '@/app/(admin)/admin/deletions/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';

function leaveRequest(over = {}) {
  return {
    id: 'lr1',
    reason: 'Falta de tiempo',
    comments: 'Gracias por todo',
    createdAt: '2026-07-01T00:00:00Z',
    user: { id: 'u1', email: 'ana@neuroalert.pe', fullName: 'Dra. Ana', role: 'SPECIALIST', createdAt: '2026-01-01T00:00:00Z' },
    ...over,
  };
}

// ---------------------------------------------------------------------------
// INTEGRATION — /admin/deletions: cola de solicitudes de baja de especialistas
// ---------------------------------------------------------------------------
describe('AdminDeletionsPage', () => {
  it('muestra el estado vacío sin solicitudes', async () => {
    server.use(http.get(`${API}/users/admin/leave-requests`, () => wrap([])));
    renderWithProviders(<AdminDeletionsPage />, { withAuth: false });

    expect(await screen.findByText(/No hay solicitudes de baja pendientes/)).toBeInTheDocument();
  });

  it('aprueba una solicitud de baja', async () => {
    const approve = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/users/admin/leave-requests`, () => wrap([leaveRequest()])),
      http.patch(`${API}/users/admin/leave-requests/lr1/approve`, approve),
    );
    const { user } = renderWithProviders(<AdminDeletionsPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Aprobar baja/ }));
    await waitFor(() => expect(approve).toHaveBeenCalled());
  });

  it('rechaza una solicitud con nota de decisión', async () => {
    const reject = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/users/admin/leave-requests`, () => wrap([leaveRequest()])),
      http.patch(`${API}/users/admin/leave-requests/lr1/reject`, reject),
    );
    const { user } = renderWithProviders(<AdminDeletionsPage />, { withAuth: false });

    await user.type(await screen.findByPlaceholderText(/Nota de decisión/), 'No procede aún');
    await user.click(screen.getByRole('button', { name: /Rechazar/ }));
    await waitFor(() => expect(reject).toHaveBeenCalled());
  });
});
