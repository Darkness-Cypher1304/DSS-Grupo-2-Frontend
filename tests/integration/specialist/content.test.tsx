import { describe, it, expect, jest } from '@jest/globals';
import { http } from 'msw';

import SpecialistContentPage from '@/app/(specialist)/specialist/content/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';

function contentItem(over = {}) {
  return {
    id: 'cnt_1',
    title: 'Señales tempranas del TEA',
    slug: 'senales',
    summary: 'Resumen del artículo educativo.',
    body: 'Cuerpo largo del artículo educativo con mucho detalle.',
    category: 'Desarrollo',
    tags: ['tea'],
    status: 'DRAFT' as const,
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-02T10:00:00Z',
    ...over,
  };
}

// ---------------------------------------------------------------------------
// INTEGRATION — /specialist/content: CRUD de artículos y envío a revisión
// ---------------------------------------------------------------------------
describe('SpecialistContentPage', () => {
  it('muestra el estado vacío cuando no hay artículos', async () => {
    server.use(http.get(`${API}/content/mine`, () => wrap([])));
    renderWithProviders(<SpecialistContentPage />, { withAuth: false });

    expect(await screen.findByText(/Aún no tienes artículos/)).toBeInTheDocument();
  });

  it('crea un artículo nuevo y cierra el formulario', async () => {
    const create = jest.fn(() => wrap({ id: 'cnt_new' }));
    server.use(
      http.get(`${API}/content/mine`, () => wrap([])),
      http.post(`${API}/content`, create),
    );
    const { user } = renderWithProviders(<SpecialistContentPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Nuevo artículo/ }));

    const boxes = screen.getAllByRole('textbox'); // [título, resumen, categoría, tags, cuerpo]
    await user.type(boxes[0], 'Título de artículo suficientemente largo');
    await user.type(boxes[1], 'Resumen con longitud suficiente para pasar la validación.');
    await user.type(boxes[2], 'Desarrollo');
    await user.type(boxes[4], 'Contenido del artículo con longitud más que suficiente para superar el mínimo requerido.');
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }));

    await waitFor(() => expect(create).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Guardar borrador' })).not.toBeInTheDocument(),
    );
  });

  it('edita un artículo existente', async () => {
    const update = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/content/mine`, () => wrap([contentItem({ title: 'Título original del artículo' })])),
      http.patch(`${API}/content/cnt_1`, update),
    );
    const { user } = renderWithProviders(<SpecialistContentPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Editar/ }));

    // El formulario abre precargado con el título del artículo
    const boxes = screen.getAllByRole('textbox');
    expect(boxes[0]).toHaveValue('Título original del artículo');
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }));

    await waitFor(() => expect(update).toHaveBeenCalled());
  });

  it('permite enviar un borrador a revisión', async () => {
    const submit = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/content/mine`, () => wrap([contentItem({ status: 'DRAFT' })])),
      http.post(`${API}/content/cnt_1/submit`, submit),
    );
    const { user } = renderWithProviders(<SpecialistContentPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Enviar a revisión/ }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
  });
});
