import { describe, it, expect, jest } from '@jest/globals';
import { http } from 'msw';

import AdminSpecialistsPage from '@/app/(admin)/admin/specialists/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';

function pendingSpecialist(over = {}) {
  return {
    id: 'ps1',
    licenseNumber: 'CMP-12345',
    specialty: 'Pediatría del Desarrollo',
    institution: 'Hospital del Niño',
    yearsOfExperience: 8,
    bio: 'Experiencia en TEA.',
    licenseDocumentKey: null,
    cvDocumentKey: null,
    createdAt: '2026-07-01T00:00:00Z',
    user: { id: 'u1', email: 'ana@neuroalert.pe', fullName: 'Dra. Ana', phoneNumber: '+51 999', createdAt: '2026-01-01T00:00:00Z' },
    ...over,
  };
}

// ---------------------------------------------------------------------------
// INTEGRATION — /admin/specialists: verificación de upgrade a especialista
// ---------------------------------------------------------------------------
describe('AdminSpecialistsPage', () => {
  it('muestra el estado vacío sin solicitudes', async () => {
    server.use(http.get(`${API}/users/admin/specialists/pending`, () => wrap([])));
    renderWithProviders(<AdminSpecialistsPage />, { withAuth: false });

    expect(await screen.findByText('No hay solicitudes pendientes.')).toBeInTheDocument();
  });

  it('aprueba una solicitud', async () => {
    const verify = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/users/admin/specialists/pending`, () => wrap([pendingSpecialist()])),
      http.patch(`${API}/users/admin/specialists/ps1/verify`, verify),
    );
    const { user } = renderWithProviders(<AdminSpecialistsPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: 'Aprobar' }));
    await waitFor(() => expect(verify).toHaveBeenCalled());
  });

  it('exige una razón de al menos 10 caracteres para rechazar', async () => {
    const verify = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/users/admin/specialists/pending`, () => wrap([pendingSpecialist()])),
      http.patch(`${API}/users/admin/specialists/ps1/verify`, verify),
    );
    const { user } = renderWithProviders(<AdminSpecialistsPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: 'Rechazar' }));
    const confirm = screen.getByRole('button', { name: 'Confirmar rechazo' });
    expect(confirm).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/no aparece registrada/), 'Colegiatura inexistente');
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    await waitFor(() => expect(verify).toHaveBeenCalled());
  });

  it('abre un documento adjunto en una pestaña nueva', async () => {
    server.use(
      http.get(`${API}/users/admin/specialists/pending`, () =>
        wrap([pendingSpecialist({ licenseDocumentKey: 'file_1' })]),
      ),
      http.get(`${API}/storage/file_1`, () =>
        new Response(new Uint8Array([1, 2, 3]), { headers: { 'Content-Type': 'application/pdf' } }),
      ),
    );
    const { user } = renderWithProviders(<AdminSpecialistsPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Ver licencia/ }));
    await waitFor(() => expect(window.open).toHaveBeenCalled());
  });
});
