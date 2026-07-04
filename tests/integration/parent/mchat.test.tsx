import { describe, it, expect, jest } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { makeQuestions, makeMchatResult } from '../../fixtures/mchat';

// El generador de PDF importa jsPDF dinámicamente; mockeamos jsPDF para no
// generar un PDF real (la lógica de mchat-pdf se prueba aparte en unit).
const pdfSave = jest.fn();
jest.mock('jspdf', () => {
  class MockJsPDF {
    internal = { pageSize: { getWidth: () => 595, getHeight: () => 842 } };
    setFillColor = jest.fn();
    rect = jest.fn();
    setTextColor = jest.fn();
    setFont = jest.fn();
    setFontSize = jest.fn();
    setDrawColor = jest.fn();
    line = jest.fn();
    splitTextToSize = (t: string) => [t];
    text = jest.fn();
    save = pdfSave;
  }
  return { jsPDF: MockJsPDF };
});
import MchatPage from '@/app/(parent)/mchat/page';

const QUESTIONS = makeQuestions(3);

function mockQuestions() {
  server.use(http.get(`${API}/mchat/questions`, () => wrap(QUESTIONS)));
}

async function answerAll(user: ReturnType<typeof renderWithProviders>['user']) {
  for (const q of QUESTIONS) {
    await screen.findByText(q.text);
    await user.click(screen.getByRole('button', { name: 'Sí' }));
  }
}

// ---------------------------------------------------------------------------
// INTEGRATION — /mchat: flujo completo intro → demografía → preguntas → review
// → cálculo → resultado (React Query + MSW). El highlight del producto.
// ---------------------------------------------------------------------------
describe('MchatPage', () => {
  it('recorre el flujo completo y muestra el resultado (riesgo bajo)', async () => {
    mockQuestions();
    server.use(http.post(`${API}/mchat`, () => wrap(makeMchatResult({ riskLevel: 'LOW' }))));
    const { user } = renderWithProviders(<MchatPage />);

    // Intro → demografía
    await user.click(await screen.findByRole('button', { name: /Empezar las 20 preguntas/ }));
    // Demografía → preguntas
    await user.click(await screen.findByRole('button', { name: /Continuar a las preguntas/ }));
    // Responder y revisar
    await answerAll(user);
    await user.click(await screen.findByRole('button', { name: /Ver mi resultado/ }));

    // Momento de marca + resultado (MIN_CALC_MS ~1.9s)
    expect(await screen.findByText('Riesgo bajo', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('Recomendaciones')).toBeInTheDocument();
  }, 15000);

  it('en riesgo no bajo ofrece hablar con un especialista y exporta PDF', async () => {
    mockQuestions();
    server.use(http.post(`${API}/mchat`, () => wrap(makeMchatResult({ riskLevel: 'HIGH', totalScore: 12 }))));
    const { user } = renderWithProviders(<MchatPage />);

    await user.click(await screen.findByRole('button', { name: /Empezar las 20 preguntas/ }));
    await user.click(await screen.findByRole('button', { name: /Continuar a las preguntas/ }));
    await answerAll(user);
    await user.click(await screen.findByRole('button', { name: /Ver mi resultado/ }));

    expect(await screen.findByText('Riesgo alto', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Hablar con un especialista/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Descargar PDF/ }));
    await waitFor(() => expect(pdfSave).toHaveBeenCalled());
  }, 15000);

  it('si el cálculo falla, vuelve a la revisión mostrando el error', async () => {
    mockQuestions();
    server.use(
      http.post(`${API}/mchat`, () =>
        HttpResponse.json({ message: 'No pudimos procesar la evaluación' }, { status: 500 }),
      ),
    );
    const { user } = renderWithProviders(<MchatPage />);

    await user.click(await screen.findByRole('button', { name: /Empezar las 20 preguntas/ }));
    await user.click(await screen.findByRole('button', { name: /Continuar a las preguntas/ }));
    await answerAll(user);
    await user.click(await screen.findByRole('button', { name: /Ver mi resultado/ }));

    expect(
      await screen.findByText('No pudimos procesar la evaluación', {}, { timeout: 4000 }),
    ).toBeInTheDocument();
  }, 15000);

  it('muestra el resultado de riesgo medio', async () => {
    mockQuestions();
    server.use(http.post(`${API}/mchat`, () => wrap(makeMchatResult({ riskLevel: 'MEDIUM' }))));
    const { user } = renderWithProviders(<MchatPage />);

    await user.click(await screen.findByRole('button', { name: /Empezar las 20 preguntas/ }));
    await user.click(await screen.findByRole('button', { name: /Continuar a las preguntas/ }));
    await answerAll(user);
    await user.click(await screen.findByRole('button', { name: /Ver mi resultado/ }));

    expect(await screen.findByText('Riesgo medio', {}, { timeout: 4000 })).toBeInTheDocument();
  }, 15000);

  it('permite volver atrás y editar respuestas desde la revisión', async () => {
    mockQuestions();
    const { user } = renderWithProviders(<MchatPage />);

    await user.click(await screen.findByRole('button', { name: /Empezar las 20 preguntas/ }));
    // Volver de demografía a la intro
    await user.click(await screen.findByRole('button', { name: 'Volver' }));
    expect(await screen.findByRole('button', { name: /Empezar las 20 preguntas/ })).toBeInTheDocument();

    // Reingresar y avanzar a preguntas
    await user.click(screen.getByRole('button', { name: /Empezar las 20 preguntas/ }));
    await user.click(await screen.findByRole('button', { name: /Continuar a las preguntas/ }));

    // Responder Q1 → Q2 → "Anterior" vuelve a Q1
    await screen.findByText(QUESTIONS[0].text);
    await user.click(screen.getByRole('button', { name: 'Sí' }));
    await screen.findByText(QUESTIONS[1].text);
    await user.click(screen.getByRole('button', { name: /Anterior/ }));
    expect(await screen.findByText(QUESTIONS[0].text)).toBeInTheDocument();

    // Completar y editar desde la revisión
    await answerAll(user);
    await screen.findByText('Revisa tus respuestas');
    await user.click(screen.getByText(QUESTIONS[0].text));
    expect(await screen.findByText(QUESTIONS[0].text)).toBeInTheDocument();
  }, 15000);

  it('permite personalizar los datos del niño en la etapa de demografía', async () => {
    mockQuestions();
    const { user } = renderWithProviders(<MchatPage />);

    await user.click(await screen.findByRole('button', { name: /Empezar las 20 preguntas/ }));
    const nombre = await screen.findByPlaceholderText('Mateo');
    await user.type(nombre, 'Lucas');
    await user.click(screen.getByRole('button', { name: 'Masculino' }));

    expect(nombre).toHaveValue('Lucas');
  });
});
