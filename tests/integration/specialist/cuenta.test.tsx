import { describe, it, expect, jest } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import SpecialistAccountPage from '@/app/(specialist)/specialist/cuenta/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { makeLoginResponse } from '../../fixtures/users';

function withSpecialist() {
  server.use(
    http.post(`${API}/auth/refresh`, () =>
      wrap(makeLoginResponse({}, { fullName: 'Ana Torres', email: 'ana@neuroalert.pe', role: 'SPECIALIST' })),
    ),
  );
}

// ---------------------------------------------------------------------------
// INTEGRATION — /specialist/cuenta: perfil + solicitud de baja
// ---------------------------------------------------------------------------
describe('SpecialistAccountPage', () => {
  it('muestra el perfil del especialista', async () => {
    withSpecialist();
    renderWithProviders(<SpecialistAccountPage />);

    await waitFor(() => expect(screen.getByText('Ana Torres')).toBeInTheDocument());
    expect(screen.getByText('ana@neuroalert.pe')).toBeInTheDocument();
  });

  it('envía la solicitud de baja y muestra la confirmación', async () => {
    withSpecialist();
    const leave = jest.fn(() => wrap({ ok: true }));
    server.use(http.post(`${API}/users/me/request-leave`, leave));
    const { user } = renderWithProviders(<SpecialistAccountPage />);

    await user.click(await screen.findByRole('button', { name: /Solicitar baja/ }));

    expect(await screen.findByText('Solicitud enviada')).toBeInTheDocument();
    await waitFor(() => expect(leave).toHaveBeenCalled());
  });

  it('muestra un error si la solicitud de baja falla', async () => {
    withSpecialist();
    server.use(
      http.post(`${API}/users/me/request-leave`, () =>
        HttpResponse.json({ message: 'Ya tienes una solicitud pendiente' }, { status: 409 }),
      ),
    );
    const { user } = renderWithProviders(<SpecialistAccountPage />);

    await user.click(await screen.findByRole('button', { name: /Solicitar baja/ }));

    expect(await screen.findByText('Ya tienes una solicitud pendiente')).toBeInTheDocument();
  });
});
