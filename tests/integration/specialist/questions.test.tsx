import { describe, it, expect, jest } from '@jest/globals';
import { http } from 'msw';

import SpecialistQuestionsPage from '@/app/(specialist)/specialist/questions/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';

function question(over = {}) {
  return {
    id: 'q_1',
    title: 'Mi hijo no señala objetos',
    body: 'Detalle de la consulta del padre para el especialista.',
    status: 'OPEN' as const,
    isUrgent: false,
    isAnonymous: false,
    childAgeMonths: 20,
    createdAt: '2026-07-01T10:00:00Z',
    author: { fullName: 'Padre Demo' },
    assignedTo: null,
    answers: [] as { id: string }[],
    ...over,
  };
}

const detail = () => ({ ...question({ status: 'ASSIGNED' }), answers: [] });

// ---------------------------------------------------------------------------
// INTEGRATION — /specialist/questions: bandeja, tomar consulta y responder
// ---------------------------------------------------------------------------
describe('SpecialistQuestionsPage', () => {
  it('permite tomar una consulta sin asignar', async () => {
    const assign = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/questions`, () => wrap([question()])),
      http.post(`${API}/questions/q_1/assign-to-me`, assign),
    );
    const { user } = renderWithProviders(<SpecialistQuestionsPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: 'Tomar consulta' }));
    await waitFor(() => expect(assign).toHaveBeenCalled());
  });

  it('expande el detalle mostrando el cuerpo y el historial', async () => {
    server.use(
      http.get(`${API}/questions`, () => wrap([question()])),
      http.get(`${API}/questions/q_1`, () => wrap(detail())),
    );
    const { user } = renderWithProviders(<SpecialistQuestionsPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Ver detalles/ }));

    expect(await screen.findByText(/Detalle de la consulta del padre/)).toBeInTheDocument();
    expect(screen.getByText(/Sin respuestas aún/)).toBeInTheDocument();
  });

  it('filtra por las pestañas de la bandeja', async () => {
    server.use(http.get(`${API}/questions`, () => wrap([question()])));
    const { user } = renderWithProviders(<SpecialistQuestionsPage />, { withAuth: false });

    // "Cerradas" no tiene la consulta OPEN → bandeja vacía
    await user.click(await screen.findByRole('button', { name: /Cerradas/ }));
    expect(await screen.findByText('No hay consultas en esta bandeja.')).toBeInTheDocument();

    // "Todas" sí la muestra
    await user.click(screen.getByRole('button', { name: 'Todas' }));
    expect(await screen.findByText('Mi hijo no señala objetos')).toBeInTheDocument();
  });

  it('valida y envía una respuesta a una consulta asignada', async () => {
    const answer = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/questions`, () => wrap([question({ status: 'ASSIGNED' })])),
      http.get(`${API}/questions/q_1`, () => wrap(detail())),
      http.post(`${API}/questions/q_1/answer`, answer),
    );
    const { user } = renderWithProviders(<SpecialistQuestionsPage />, { withAuth: false });

    // La consulta ASSIGNED vive en la pestaña "En mis manos".
    await user.click(await screen.findByRole('button', { name: /En mis manos/ }));
    await user.click(await screen.findByRole('button', { name: 'Responder' }));

    // Validación: respuesta demasiado corta
    await user.click(screen.getByRole('button', { name: /Enviar respuesta/ }));
    expect(await screen.findByText('Tu respuesta debe ser más detallada')).toBeInTheDocument();

    // Respuesta válida
    await user.type(
      screen.getByPlaceholderText(/Sé claro, empático/),
      'Te recomiendo observar estas señales y acudir a control con tu pediatra pronto.',
    );
    await user.click(screen.getByRole('button', { name: /Enviar respuesta/ }));
    await waitFor(() => expect(answer).toHaveBeenCalled());
  });
});
