import { describe, it, expect, jest } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import ParentAccountPage from '@/app/(parent)/cuenta/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { router } from '../../mocks/next-navigation';

function meProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'usr_1',
    email: 'padre@neuroalert.pe',
    fullName: 'Padre Demo',
    status: 'ACTIVE',
    deletionRequestedAt: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// INTEGRATION — /cuenta (padre): perfil + autoeliminación con confirmación
// ---------------------------------------------------------------------------
describe('ParentAccountPage', () => {
  it('muestra el perfil del usuario', async () => {
    server.use(http.get(`${API}/users/me`, () => wrap(meProfile())));
    renderWithProviders(<ParentAccountPage />);

    expect(await screen.findByText('Padre Demo')).toBeInTheDocument();
    expect(screen.getByText('padre@neuroalert.pe')).toBeInTheDocument();
  });

  it('exige contraseña y la palabra ELIMINAR antes de confirmar', async () => {
    server.use(http.get(`${API}/users/me`, () => wrap(meProfile())));
    const { user } = renderWithProviders(<ParentAccountPage />);

    await user.click(await screen.findByRole('button', { name: /Eliminar mi cuenta/ }));
    const confirmBtn = screen.getByRole('button', { name: 'Eliminar definitivamente' });
    expect(confirmBtn).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Tu contraseña'), 'Password2026!');
    await user.type(screen.getByPlaceholderText('ELIMINAR'), 'ELIMINAR');
    expect(confirmBtn).toBeEnabled();
  });

  it('al confirmar la eliminación cierra sesión y redirige', async () => {
    const del = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/users/me`, () => wrap(meProfile())),
      http.post(`${API}/users/me/request-deletion`, del),
      http.post(`${API}/auth/logout`, () => wrap({})),
    );
    const { user } = renderWithProviders(<ParentAccountPage />);

    await user.click(await screen.findByRole('button', { name: /Eliminar mi cuenta/ }));
    await user.type(screen.getByPlaceholderText('Tu contraseña'), 'Password2026!');
    await user.type(screen.getByPlaceholderText('ELIMINAR'), 'ELIMINAR');
    await user.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }));

    await waitFor(() => expect(del).toHaveBeenCalled());
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/?bye=1'));
  });

  it('muestra un error si la eliminación falla', async () => {
    server.use(
      http.get(`${API}/users/me`, () => wrap(meProfile())),
      http.post(`${API}/users/me/request-deletion`, () =>
        HttpResponse.json({ message: 'Contraseña incorrecta' }, { status: 400 }),
      ),
    );
    const { user } = renderWithProviders(<ParentAccountPage />);

    await user.click(await screen.findByRole('button', { name: /Eliminar mi cuenta/ }));
    await user.type(screen.getByPlaceholderText('Tu contraseña'), 'mala');
    await user.type(screen.getByPlaceholderText('ELIMINAR'), 'ELIMINAR');
    await user.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }));

    expect(await screen.findByText('Contraseña incorrecta')).toBeInTheDocument();
  });

  it('permite cancelar y cerrar el modal', async () => {
    server.use(http.get(`${API}/users/me`, () => wrap(meProfile())));
    const { user } = renderWithProviders(<ParentAccountPage />);

    await user.click(await screen.findByRole('button', { name: /Eliminar mi cuenta/ }));
    expect(screen.getByText('¿Eliminar tu cuenta?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByText('¿Eliminar tu cuenta?')).not.toBeInTheDocument());
  });

  it('en estado PENDING_DELETION permite cancelar la eliminación', async () => {
    const cancel = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/users/me`, () =>
        wrap(meProfile({ status: 'PENDING_DELETION', deletionRequestedAt: '2026-07-01T00:00:00Z' })),
      ),
      http.post(`${API}/users/me/cancel-deletion`, cancel),
    );
    const { user } = renderWithProviders(<ParentAccountPage />);

    await user.click(await screen.findByRole('button', { name: /Cancelar eliminación/ }));
    await waitFor(() => expect(cancel).toHaveBeenCalled());
  });
});
