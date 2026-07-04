import { describe, it, expect } from '@jest/globals';
import { http } from 'msw';

import PublicArticlesPage from '@/app/articles/page';
import { renderWithProviders, screen } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { makeArticle } from '../../fixtures/content';

// ---------------------------------------------------------------------------
// INTEGRATION — /articles: listado público de artículos
// ---------------------------------------------------------------------------
describe('PublicArticlesPage', () => {
  it('lista los artículos publicados con enlace al detalle', async () => {
    server.use(
      http.get(`${API}/content`, () =>
        wrap({ items: [makeArticle({ title: 'Detección temprana', slug: 'deteccion' })] }),
      ),
    );
    renderWithProviders(<PublicArticlesPage />, { withAuth: false });

    const card = await screen.findByRole('link', { name: /Detección temprana/ });
    expect(card).toHaveAttribute('href', '/articles/deteccion');
  });

  it('muestra el estado vacío cuando no hay artículos', async () => {
    server.use(http.get(`${API}/content`, () => wrap({ items: [] })));
    renderWithProviders(<PublicArticlesPage />, { withAuth: false });

    expect(await screen.findByText('Aún no hay artículos publicados.')).toBeInTheDocument();
  });
});
