import { describe, it, expect, jest } from '@jest/globals';
import { http } from 'msw';

import AdminContentPage from '@/app/(admin)/admin/content/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';

function pending(over = {}) {
  return {
    id: 'c1',
    title: 'Señales del TEA a los 18 meses',
    summary: 'Un resumen del artículo.',
    body: 'Cuerpo del artículo en **markdown**.',
    category: 'Desarrollo',
    tags: ['tea'],
    updatedAt: '2026-07-01T00:00:00Z',
    author: { id: 'a1', fullName: 'Dra. Ana', email: 'ana@neuroalert.pe' },
    ...over,
  };
}

// ---------------------------------------------------------------------------
// INTEGRATION — /admin/content: revisión editorial (publicar / rechazar)
// ---------------------------------------------------------------------------
describe('AdminContentPage', () => {
  it('muestra el estado vacío sin artículos pendientes', async () => {
    server.use(http.get(`${API}/content/admin/pending`, () => wrap([])));
    renderWithProviders(<AdminContentPage />, { withAuth: false });

    expect(await screen.findByText(/No hay artículos pendientes de revisión/)).toBeInTheDocument();
  });

  it('publica un artículo pendiente', async () => {
    const publish = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/content/admin/pending`, () => wrap([pending()])),
      http.patch(`${API}/content/admin/c1/status`, publish),
    );
    const { user } = renderWithProviders(<AdminContentPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Publicar/ }));
    await waitFor(() => expect(publish).toHaveBeenCalled());
  });

  it('muestra el contenido completo al expandir', async () => {
    server.use(http.get(`${API}/content/admin/pending`, () => wrap([pending()])));
    const { user } = renderWithProviders(<AdminContentPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Ver contenido completo/ }));
    expect(await screen.findByText(/Cuerpo del artículo/)).toBeInTheDocument();
  });

  it('rechaza un artículo con notas de revisión', async () => {
    const decide = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/content/admin/pending`, () => wrap([pending()])),
      http.patch(`${API}/content/admin/c1/status`, decide),
    );
    const { user } = renderWithProviders(<AdminContentPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /^Rechazar/ }));
    await user.type(screen.getByPlaceholderText(/por qué se rechaza/), 'Falta base científica');
    await user.click(screen.getByRole('button', { name: /Confirmar rechazo/ }));

    await waitFor(() => expect(decide).toHaveBeenCalled());
  });
});
