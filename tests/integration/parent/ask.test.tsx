import { describe, it, expect, jest } from '@jest/globals';
import { http } from 'msw';

import AskPage from '@/app/(parent)/ask/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { makeQuestion } from '../../fixtures/questions';

// ---------------------------------------------------------------------------
// INTEGRATION — /ask: lista de consultas + creación (React Query + RHF + MSW)
// ---------------------------------------------------------------------------
describe('AskPage', () => {
  it('muestra el estado vacío cuando no hay consultas', async () => {
    server.use(http.get(`${API}/questions`, () => wrap([])));
    renderWithProviders(<AskPage />, { withAuth: false });

    expect(await screen.findByText(/Aún no has hecho consultas/)).toBeInTheDocument();
  });

  it('lista las consultas existentes con su estado', async () => {
    server.use(
      http.get(`${API}/questions`, () =>
        wrap([makeQuestion({ status: 'ANSWERED', answers: [{ id: 'a1' }] })]),
      ),
    );
    renderWithProviders(<AskPage />, { withAuth: false });

    expect(await screen.findByRole('heading', { name: /no señala/ })).toBeInTheDocument();
    expect(screen.getByText('Respondida')).toBeInTheDocument();
  });

  it('valida el formulario de nueva consulta', async () => {
    server.use(http.get(`${API}/questions`, () => wrap([])));
    const { user } = renderWithProviders(<AskPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Nueva consulta/ }));
    await user.click(screen.getByRole('button', { name: 'Enviar consulta' }));

    expect(await screen.findByText('Mínimo 10 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Cuéntanos un poco más')).toBeInTheDocument();
  });

  it('crea una consulta válida y cierra el formulario', async () => {
    const create = jest.fn(() => wrap({ id: 'q_new' }));
    server.use(
      http.get(`${API}/questions`, () => wrap([])),
      http.post(`${API}/questions`, create),
    );
    const { user } = renderWithProviders(<AskPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Nueva consulta/ }));
    await user.type(
      screen.getByPlaceholderText(/no me mira a los ojos/),
      '¿Mi hijo de 20 meses no señala objetos?',
    );
    await user.type(
      screen.getByPlaceholderText(/Describe lo que has observado/),
      'Desde hace dos meses no señala ni pide con el dedo, quiero orientación.',
    );
    await user.click(screen.getByRole('button', { name: 'Enviar consulta' }));

    await waitFor(() => expect(create).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Enviar consulta' })).not.toBeInTheDocument(),
    );
  });
});
