import { describe, it, expect } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import ArticlePage from '@/app/articles/[slug]/page';
import { renderWithProviders, screen } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { setParams } from '../../mocks/next-navigation';

function article(over = {}) {
  return {
    id: 'cnt_1',
    slug: 'deteccion-temprana',
    title: 'Detección temprana del TEA',
    summary: 'Por qué importa detectar a tiempo.',
    body: 'Contenido del artículo en **markdown**.',
    category: 'Desarrollo',
    tags: ['tea', 'desarrollo'],
    publishedAt: '2026-06-01T10:00:00Z',
    author: {
      id: 'a1',
      fullName: 'Dra. Ana Torres',
      specialistProfile: { specialty: 'Pediatría', institution: 'Hospital del Niño' },
    },
    ...over,
  };
}

// ---------------------------------------------------------------------------
// INTEGRATION — /articles/[slug]: detalle del artículo (por slug)
// ---------------------------------------------------------------------------
describe('ArticlePage', () => {
  it('muestra el artículo con su cuerpo y sus tags', async () => {
    setParams({ slug: 'deteccion-temprana' });
    server.use(http.get(`${API}/content/by-slug/deteccion-temprana`, () => wrap(article())));
    renderWithProviders(<ArticlePage />, { withAuth: false });

    expect(await screen.findByRole('heading', { name: 'Detección temprana del TEA' })).toBeInTheDocument();
    expect(screen.getByText(/Contenido del artículo/)).toBeInTheDocument();
    expect(screen.getByText('#tea')).toBeInTheDocument();
  });

  it('muestra "no encontrado" cuando el artículo no existe', async () => {
    setParams({ slug: 'inexistente' });
    server.use(
      http.get(`${API}/content/by-slug/inexistente`, () => new HttpResponse(null, { status: 404 })),
    );
    renderWithProviders(<ArticlePage />, { withAuth: false });

    expect(await screen.findByText('Artículo no encontrado')).toBeInTheDocument();
  });
});
