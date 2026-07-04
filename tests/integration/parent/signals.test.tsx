import { describe, it, expect } from '@jest/globals';
import { http } from 'msw';

import SignalsPage from '@/app/(parent)/signals/page';
import { renderWithProviders, screen } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { makeArticle, makeContentList } from '../../fixtures/content';

// ---------------------------------------------------------------------------
// INTEGRATION — /signals: listado de artículos educativos (React Query + MSW)
// ---------------------------------------------------------------------------
describe('SignalsPage', () => {
  it('muestra los artículos publicados con enlace al detalle', async () => {
    server.use(
      http.get(`${API}/content`, () =>
        wrap(makeContentList([makeArticle({ title: 'Señales tempranas del TEA', slug: 'senales' })])),
      ),
    );
    renderWithProviders(<SignalsPage />, { withAuth: false });

    const card = await screen.findByRole('link', { name: /Señales tempranas del TEA/ });
    expect(card).toHaveAttribute('href', '/articles/senales');
  });

  it('muestra el estado vacío cuando no hay artículos', async () => {
    server.use(http.get(`${API}/content`, () => wrap(makeContentList([]))));
    renderWithProviders(<SignalsPage />, { withAuth: false });

    expect(await screen.findByText(/Aún no hay artículos publicados/)).toBeInTheDocument();
  });
});
