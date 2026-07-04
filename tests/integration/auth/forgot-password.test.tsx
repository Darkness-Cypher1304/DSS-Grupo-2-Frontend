import { describe, it, expect } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import { renderWithProviders, screen } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';

// ---------------------------------------------------------------------------
// INTEGRATION — /forgot-password: solicitud y respuesta genérica (anti-enumeración)
// ---------------------------------------------------------------------------
describe('ForgotPasswordPage', () => {
  it('envía la solicitud y muestra la confirmación genérica con el correo', async () => {
    server.use(http.post(`${API}/auth/forgot-password`, () => wrap({ message: 'ok' })));
    const { user } = renderWithProviders(<ForgotPasswordPage />, { withAuth: false });

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com');
    await user.click(screen.getByRole('button', { name: /Enviar enlace/ }));

    expect(await screen.findByText('Revisa tu correo')).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
  });

  it('muestra un error si la solicitud falla', async () => {
    server.use(
      http.post(`${API}/auth/forgot-password`, () =>
        HttpResponse.json({ message: 'Servicio no disponible' }, { status: 500 }),
      ),
    );
    const { user } = renderWithProviders(<ForgotPasswordPage />, { withAuth: false });

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com');
    await user.click(screen.getByRole('button', { name: /Enviar enlace/ }));

    expect(await screen.findByText('Servicio no disponible')).toBeInTheDocument();
  });
});
