import { describe, it, expect } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import ActivatePage from '@/app/(auth)/activar/page';
import { renderWithProviders, screen } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { setSearchParams } from '../../mocks/next-navigation';

// ---------------------------------------------------------------------------
// INTEGRATION — /activar: activación de especialista (define su contraseña)
// ---------------------------------------------------------------------------
describe('ActivatePage', () => {
  it('sin token muestra "Enlace inválido"', async () => {
    setSearchParams();
    renderWithProviders(<ActivatePage />, { withAuth: false });

    expect(await screen.findByText('Enlace inválido')).toBeInTheDocument();
  });

  it('valida el largo mínimo de la contraseña', async () => {
    setSearchParams({ token: 'tok-1' });
    const { user } = renderWithProviders(<ActivatePage />, { withAuth: false });

    await user.type(screen.getByLabelText('Nueva contraseña'), 'corta');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'corta');
    await user.click(screen.getByRole('button', { name: 'Activar cuenta' }));

    expect(await screen.findByText('Mínimo 12 caracteres')).toBeInTheDocument();
  });

  it('activa la cuenta con datos válidos', async () => {
    setSearchParams({ token: 'tok-1' });
    server.use(http.post(`${API}/auth/activate-specialist`, () => wrap({ message: 'ok' })));
    const { user } = renderWithProviders(<ActivatePage />, { withAuth: false });

    await user.type(screen.getByLabelText('Nueva contraseña'), 'Password2026!');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password2026!');
    await user.click(screen.getByRole('button', { name: 'Activar cuenta' }));

    expect(await screen.findByText('¡Cuenta activada!')).toBeInTheDocument();
  });

  it('valida que las contraseñas coincidan', async () => {
    setSearchParams({ token: 'tok-1' });
    const { user } = renderWithProviders(<ActivatePage />, { withAuth: false });

    await user.type(screen.getByLabelText('Nueva contraseña'), 'Password2026!');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password2027!');
    await user.click(screen.getByRole('button', { name: 'Activar cuenta' }));

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('permite alternar la visibilidad de la contraseña', async () => {
    setSearchParams({ token: 'tok-1' });
    const { user } = renderWithProviders(<ActivatePage />, { withAuth: false });
    const pass = screen.getByLabelText('Nueva contraseña') as HTMLInputElement;
    expect(pass.type).toBe('password');

    await user.click(screen.getByRole('button', { name: 'Mostrar' }));
    expect(pass.type).toBe('text');
  });

  it('muestra el error del backend cuando el enlace expiró', async () => {
    setSearchParams({ token: 'tok-viejo' });
    server.use(
      http.post(`${API}/auth/activate-specialist`, () =>
        HttpResponse.json({ message: 'El enlace expiró' }, { status: 400 }),
      ),
    );
    const { user } = renderWithProviders(<ActivatePage />, { withAuth: false });

    await user.type(screen.getByLabelText('Nueva contraseña'), 'Password2026!');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password2026!');
    await user.click(screen.getByRole('button', { name: 'Activar cuenta' }));

    expect(await screen.findByText('El enlace expiró')).toBeInTheDocument();
  });
});
