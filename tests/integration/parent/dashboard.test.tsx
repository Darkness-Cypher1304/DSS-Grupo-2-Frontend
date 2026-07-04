import { describe, it, expect } from '@jest/globals';
import { http } from 'msw';

import DashboardPage from '@/app/(parent)/dashboard/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { makeLoginResponse } from '../../fixtures/users';

// ---------------------------------------------------------------------------
// INTEGRATION — /dashboard (padre): saluda con el nombre y ofrece los accesos
// ---------------------------------------------------------------------------
describe('ParentDashboard', () => {
  it('saluda con el primer nombre del usuario autenticado', async () => {
    server.use(
      http.post(`${API}/auth/refresh`, () =>
        wrap(makeLoginResponse({}, { fullName: 'Meyshel Ospinal' })),
      ),
    );
    renderWithProviders(<DashboardPage />);

    await waitFor(() => expect(screen.getByText('Meyshel')).toBeInTheDocument());
  });

  it('ofrece los accesos principales (M-CHAT, señales, consultas, recursos)', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole('link', { name: /Empezar evaluación/ })).toHaveAttribute('href', '/mchat');
    expect(screen.getByRole('link', { name: /Señales tempranas/ })).toHaveAttribute('href', '/signals');
    expect(screen.getByRole('link', { name: /Hacer una consulta/ })).toHaveAttribute('href', '/ask');
    expect(screen.getByRole('link', { name: /Biblioteca de recursos/ })).toHaveAttribute('href', '/resources');
  });
});
