import { describe, it, expect, jest } from '@jest/globals';
import { http } from 'msw';

import { NotificationBell } from '@/components/notification-bell';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { router } from '../../mocks/next-navigation';
import { makeNotification } from '../../fixtures/notifications';

// ---------------------------------------------------------------------------
// INTEGRATION — NotificationBell: polling del contador + panel + mutaciones
// (React Query + MSW). Se valida el comportamiento observable, no la implementación.
// ---------------------------------------------------------------------------
describe('NotificationBell', () => {
  it('muestra el badge con el número de no leídas', async () => {
    server.use(http.get(`${API}/notifications/unread-count`, () => wrap({ count: 3 })));

    renderWithProviders(<NotificationBell />, { withAuth: false });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /3 sin leer/ })).toBeInTheDocument(),
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('trunca el badge a "9+" cuando hay más de 9', async () => {
    server.use(http.get(`${API}/notifications/unread-count`, () => wrap({ count: 25 })));

    renderWithProviders(<NotificationBell />, { withAuth: false });

    await waitFor(() => expect(screen.getByText('9+')).toBeInTheDocument());
  });

  it('al abrir el panel lista las notificaciones', async () => {
    server.use(
      http.get(`${API}/notifications/unread-count`, () => wrap({ count: 1 })),
      http.get(`${API}/notifications`, () =>
        wrap([makeNotification({ title: 'Respuesta recibida' })]),
      ),
    );
    const { user } = renderWithProviders(<NotificationBell />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Notificaciones/ }));

    expect(await screen.findByText('Respuesta recibida')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay notificaciones', async () => {
    server.use(http.get(`${API}/notifications`, () => wrap([])));
    const { user } = renderWithProviders(<NotificationBell />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: 'Notificaciones' }));

    expect(await screen.findByText(/No tienes notificaciones todavía/)).toBeInTheDocument();
  });

  it('al hacer clic en una notificación de consulta navega al detalle y la marca leída', async () => {
    const markOne = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/notifications/unread-count`, () => wrap({ count: 1 })),
      http.get(`${API}/notifications`, () =>
        wrap([makeNotification({ id: 'ntf_9', relatedType: 'Question', relatedId: 'q_42' })]),
      ),
      http.patch(`${API}/notifications/ntf_9/read`, markOne),
    );
    const { user } = renderWithProviders(<NotificationBell />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Notificaciones/ }));
    await user.click(await screen.findByText('Un especialista respondió tu consulta'));

    await waitFor(() => expect(markOne).toHaveBeenCalled());
    expect(router.push).toHaveBeenCalledWith('/ask/q_42');
  });

  it('"Marcar todas" invoca el endpoint read-all', async () => {
    const markAll = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/notifications/unread-count`, () => wrap({ count: 2 })),
      http.get(`${API}/notifications`, () => wrap([makeNotification()])),
      http.patch(`${API}/notifications/read-all`, markAll),
    );
    const { user } = renderWithProviders(<NotificationBell />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Notificaciones/ }));
    await user.click(await screen.findByRole('button', { name: /Marcar todas/ }));

    await waitFor(() => expect(markAll).toHaveBeenCalled());
  });
});
