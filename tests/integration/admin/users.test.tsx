import { describe, it, expect, jest } from '@jest/globals';
import { http } from 'msw';

import AdminUsersPage from '@/app/(admin)/admin/users/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';

function user(over = {}) {
  return {
    id: 'u1',
    email: 'padre@neuroalert.pe',
    fullName: 'Padre Demo',
    role: 'PARENT',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: '2026-06-01T00:00:00Z',
    lastLoginAt: '2026-07-01T00:00:00Z',
    ...over,
  };
}

const list = (items: unknown[]) => ({
  items,
  pagination: { page: 1, perPage: 20, total: items.length, totalPages: 1 },
});

// ---------------------------------------------------------------------------
// INTEGRATION — /admin/users: tabla, suspensión y verificación manual
// ---------------------------------------------------------------------------
describe('AdminUsersPage', () => {
  it('muestra el estado vacío sin usuarios', async () => {
    server.use(http.get(`${API}/users/admin/all`, () => wrap(list([]))));
    renderWithProviders(<AdminUsersPage />, { withAuth: false });

    expect(await screen.findByText('No hay usuarios.')).toBeInTheDocument();
  });

  it('suspende a un usuario activo', async () => {
    const suspend = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/users/admin/all`, () => wrap(list([user()]))),
      http.patch(`${API}/users/admin/u1/status`, suspend),
    );
    const { user: ui } = renderWithProviders(<AdminUsersPage />, { withAuth: false });

    await ui.click(await screen.findByRole('button', { name: /Suspender/ }));
    await waitFor(() => expect(suspend).toHaveBeenCalled());
  });

  it('reactiva a un usuario suspendido', async () => {
    const reactivate = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/users/admin/all`, () => wrap(list([user({ status: 'SUSPENDED' })]))),
      http.patch(`${API}/users/admin/u1/status`, reactivate),
    );
    const { user: ui } = renderWithProviders(<AdminUsersPage />, { withAuth: false });

    await ui.click(await screen.findByRole('button', { name: /Reactivar/ }));
    await waitFor(() => expect(reactivate).toHaveBeenCalled());
  });

  it('pagina cuando hay más de una página', async () => {
    server.use(
      http.get(`${API}/users/admin/all`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        const u = user({ id: page === '2' ? 'u2' : 'u1', fullName: page === '2' ? 'Segunda Página' : 'Primera Página' });
        return wrap({ items: [u], pagination: { page: Number(page), perPage: 20, total: 40, totalPages: 2 } });
      }),
    );
    const { user: ui } = renderWithProviders(<AdminUsersPage />, { withAuth: false });

    expect(await screen.findByText('Primera Página')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();

    await ui.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('Segunda Página')).toBeInTheDocument();
  });

  it('verifica el correo de un usuario no verificado', async () => {
    const verify = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/users/admin/all`, () =>
        wrap(list([user({ emailVerified: false, status: 'PENDING_VERIFICATION' })])),
      ),
      http.patch(`${API}/users/admin/u1/verify-email`, verify),
    );
    const { user: ui } = renderWithProviders(<AdminUsersPage />, { withAuth: false });

    await ui.click(await screen.findByRole('button', { name: /Verificar/ }));
    await waitFor(() => expect(verify).toHaveBeenCalled());
  });
});
