import { describe, it, expect } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import VerifyEmailPage from '@/app/(auth)/verify-email/page';
import { renderWithProviders, screen } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { setSearchParams } from '../../mocks/next-navigation';

// ---------------------------------------------------------------------------
// INTEGRATION — /verify-email: consume el token al montar y muestra el resultado
// ---------------------------------------------------------------------------
describe('VerifyEmailPage', () => {
  it('sin token muestra estado de error', async () => {
    setSearchParams();
    renderWithProviders(<VerifyEmailPage />, { withAuth: false });

    expect(await screen.findByText('No pudimos verificar')).toBeInTheDocument();
    expect(screen.getByText(/inválido o está incompleto/)).toBeInTheDocument();
  });

  it('con token válido verifica el correo', async () => {
    setSearchParams({ token: 'tok-ok' });
    server.use(
      http.post(`${API}/auth/verify-email`, () => wrap({ message: 'Tu correo fue verificado' })),
    );
    renderWithProviders(<VerifyEmailPage />, { withAuth: false });

    expect(await screen.findByText('¡Correo verificado!')).toBeInTheDocument();
    expect(screen.getByText('Tu correo fue verificado')).toBeInTheDocument();
  });

  it('con token inválido muestra el error del backend', async () => {
    setSearchParams({ token: 'tok-malo' });
    server.use(
      http.post(`${API}/auth/verify-email`, () =>
        HttpResponse.json({ message: 'El enlace ya fue usado' }, { status: 400 }),
      ),
    );
    renderWithProviders(<VerifyEmailPage />, { withAuth: false });

    expect(await screen.findByText('No pudimos verificar')).toBeInTheDocument();
    expect(await screen.findByText('El enlace ya fue usado')).toBeInTheDocument();
  });
});
