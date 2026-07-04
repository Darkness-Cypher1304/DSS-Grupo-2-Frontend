import { describe, it, expect } from '@jest/globals';
import { http } from 'msw';

import SpecialistDashboard from '@/app/(specialist)/specialist/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { makeLoginResponse } from '../../fixtures/users';

function openQuestion(over = {}) {
  return {
    id: 'q_1',
    title: 'Mi hijo no responde a su nombre',
    status: 'OPEN',
    isUrgent: true,
    createdAt: '2026-07-01T10:00:00Z',
    childAgeMonths: 22,
    ...over,
  };
}

// ---------------------------------------------------------------------------
// INTEGRATION — /specialist: panel con métricas y bandejas
// ---------------------------------------------------------------------------
describe('SpecialistDashboard', () => {
  it('saluda al especialista y lista las consultas sin asignar', async () => {
    server.use(
      http.post(`${API}/auth/refresh`, () =>
        wrap(makeLoginResponse({}, { fullName: 'Ana Torres', role: 'SPECIALIST' })),
      ),
      http.get(`${API}/questions`, () => wrap([openQuestion()])),
      http.get(`${API}/content/mine`, () => wrap([])),
    );
    renderWithProviders(<SpecialistDashboard />);

    await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument());
    expect(await screen.findByText('Mi hijo no responde a su nombre')).toBeInTheDocument();
  });

  it('lista el contenido del especialista con sus estados', async () => {
    server.use(
      http.get(`${API}/questions`, () => wrap([openQuestion(), openQuestion({ id: 'q_2', status: 'ASSIGNED' })])),
      http.get(`${API}/content/mine`, () =>
        wrap([
          { id: 'c1', title: 'Artículo publicado', status: 'PUBLISHED' },
          { id: 'c2', title: 'Borrador pendiente', status: 'DRAFT' },
          { id: 'c3', title: 'En revisión', status: 'PENDING' },
        ]),
      ),
    );
    renderWithProviders(<SpecialistDashboard />);

    expect(await screen.findByText('Artículo publicado')).toBeInTheDocument();
    expect(screen.getByText('Borrador pendiente')).toBeInTheDocument();
    expect(screen.getByText('En revisión')).toBeInTheDocument();
  });

  it('invita a crear el primer artículo cuando no hay contenido', async () => {
    server.use(
      http.get(`${API}/questions`, () => wrap([])),
      http.get(`${API}/content/mine`, () => wrap([])),
    );
    renderWithProviders(<SpecialistDashboard />);

    expect(await screen.findByText('No hay consultas pendientes 🎉')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear primer artículo' })).toBeInTheDocument();
  });
});
