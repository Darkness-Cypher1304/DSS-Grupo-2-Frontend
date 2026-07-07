import { describe, it, expect } from '@jest/globals';
import { http } from 'msw';

import AdminDashboard from '@/app/(admin)/admin/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { makeLoginResponse } from '../../fixtures/users';

// ---------------------------------------------------------------------------
// INTEGRATION — /admin: panel con el contenido pendiente de revisión
// ---------------------------------------------------------------------------
describe('AdminDashboard', () => {
  it('muestra el panel con el contenido pendiente de revisión', async () => {
    server.use(
      http.post(`${API}/auth/refresh`, () =>
        wrap(makeLoginResponse({}, { fullName: 'Admin Root', role: 'ADMIN' })),
      ),
      http.get(`${API}/content/admin/pending`, () =>
        wrap([{ id: 'c1', title: 'Artículo en revisión', author: { fullName: 'Dr. Autor' } }]),
      ),
    );
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());
    expect(await screen.findByText('Artículo en revisión')).toBeInTheDocument();
  });
});
