import { describe, it, expect, jest } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import QuestionDetailPage from '@/app/(parent)/ask/[id]/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { router, setParams } from '../../mocks/next-navigation';
import { makeQuestionDetail, makeAnswer } from '../../fixtures/questions';

// ---------------------------------------------------------------------------
// INTEGRATION — /ask/[id]: detalle de consulta, respuestas y acciones
// ---------------------------------------------------------------------------
describe('QuestionDetailPage', () => {
  it('muestra el detalle y las respuestas', async () => {
    setParams({ id: 'q_1' });
    server.use(http.get(`${API}/questions/q_1`, () => wrap(makeQuestionDetail())));
    renderWithProviders(<QuestionDetailPage />, { withAuth: false });

    expect(await screen.findByRole('heading', { name: /no señala/ })).toBeInTheDocument();
    expect(screen.getByText(/observar y consultar con tu pediatra/)).toBeInTheDocument();
  });

  it('ante 404 (IDOR/no existe) muestra "no disponible" y permite volver', async () => {
    setParams({ id: 'q_x' });
    server.use(
      http.get(`${API}/questions/q_x`, () => new HttpResponse(null, { status: 404 })),
    );
    const { user } = renderWithProviders(<QuestionDetailPage />, { withAuth: false });

    expect(await screen.findByText('Consulta no disponible')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Volver a mis consultas/ }));
    expect(router.push).toHaveBeenCalledWith('/ask');
  });

  it('permite aceptar una respuesta', async () => {
    setParams({ id: 'q_1' });
    const accept = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/questions/q_1`, () =>
        wrap(makeQuestionDetail({ status: 'ANSWERED', answers: [makeAnswer({ id: 'ans_9' })] })),
      ),
      http.patch(`${API}/questions/answers/ans_9/accept`, accept),
    );
    const { user } = renderWithProviders(<QuestionDetailPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Marcar como aceptada/ }));
    await waitFor(() => expect(accept).toHaveBeenCalled());
  });

  it('una consulta cerrada con respuesta aceptada no ofrece más acciones', async () => {
    setParams({ id: 'q_1' });
    server.use(
      http.get(`${API}/questions/q_1`, () =>
        wrap(
          makeQuestionDetail({
            status: 'CLOSED',
            childAgeMonths: null,
            answers: [makeAnswer({ isAccepted: true })],
          }),
        ),
      ),
    );
    renderWithProviders(<QuestionDetailPage />, { withAuth: false });

    expect(await screen.findByText(/Aceptada/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar consulta' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marcar como aceptada/ })).not.toBeInTheDocument();
  });

  it('permite cerrar la consulta', async () => {
    setParams({ id: 'q_1' });
    const close = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/questions/q_1`, () => wrap(makeQuestionDetail({ status: 'ANSWERED' }))),
      http.patch(`${API}/questions/q_1/close`, close),
    );
    const { user } = renderWithProviders(<QuestionDetailPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: 'Cerrar consulta' }));
    await waitFor(() => expect(close).toHaveBeenCalled());
  });
});
