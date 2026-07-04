import { describe, it, expect } from '@jest/globals';
import { http } from 'msw';

import AdminDashboard from '@/app/(admin)/admin/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { makeLoginResponse } from '../../fixtures/users';

// ---------------------------------------------------------------------------
// INTEGRATION — /admin: panel con pendientes de verificación y revisión
// ---------------------------------------------------------------------------
describe('AdminDashboard', () => {
  it('muestra los especialistas pendientes y el contenido sin pendientes', async () => {
    server.use(
      http.post(`${API}/auth/refresh`, () =>
        wrap(makeLoginResponse({}, { fullName: 'Admin Root', role: 'ADMIN' })),
      ),
      http.get(`${API}/users/admin/specialists/pending`, () =>
        wrap([{ id: 's1', user: { id: 'u1', email: 'a@a.pe', fullName: 'Dra. Ana' }, specialty: 'Pediatría', licenseNumber: 'CMP-1' }]),
      ),
      http.get(`${API}/content/admin/pending`, () => wrap([])),
    );
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());
    expect(await screen.findByText('Dra. Ana')).toBeInTheDocument();
    expect(screen.getByText('✓ Sin artículos pendientes')).toBeInTheDocument();
  });
});
