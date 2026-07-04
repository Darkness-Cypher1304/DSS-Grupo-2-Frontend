import { describe, it, expect } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import ResetPasswordPage from '@/app/(auth)/reset-password/page';
import { renderWithProviders, screen } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { setSearchParams } from '../../mocks/next-navigation';

// ---------------------------------------------------------------------------
// INTEGRATION — /reset-password: token, validaciones locales y guardado
// ---------------------------------------------------------------------------
describe('ResetPasswordPage', () => {
  it('sin token, al enviar avisa que el enlace es inválido', async () => {
    setSearchParams(); // sin ?token=
    const { user } = renderWithProviders(<ResetPasswordPage />, { withAuth: false });

    await user.type(screen.getByLabelText('Nueva contraseña'), 'Password2026!');
    await user.type(screen.getByLabelText('Repite la contraseña'), 'Password2026!');
    await user.click(screen.getByRole('button', { name: /Guardar contraseña/ }));

    expect(await screen.findByText(/El enlace de reseteo es inválido/)).toBeInTheDocument();
  });

  it('valida el largo mínimo de la contraseña', async () => {
    setSearchParams({ token: 'tok-1' });
    const { user } = renderWithProviders(<ResetPasswordPage />, { withAuth: false });

    await user.type(screen.getByLabelText('Nueva contraseña'), 'corta');
    await user.type(screen.getByLabelText('Repite la contraseña'), 'corta');
    await user.click(screen.getByRole('button', { name: /Guardar contraseña/ }));

    expect(
      await screen.findByText('La contraseña debe tener al menos 12 caracteres.'),
    ).toBeInTheDocument();
  });

  it('valida que las contraseñas coincidan', async () => {
    setSearchParams({ token: 'tok-1' });
    const { user } = renderWithProviders(<ResetPasswordPage />, { withAuth: false });

    await user.type(screen.getByLabelText('Nueva contraseña'), 'Password2026!');
    await user.type(screen.getByLabelText('Repite la contraseña'), 'Password2027!');
    await user.click(screen.getByRole('button', { name: /Guardar contraseña/ }));

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('con token válido guarda la contraseña y confirma', async () => {
    setSearchParams({ token: 'tok-1' });
    server.use(http.post(`${API}/auth/reset-password`, () => wrap({ message: 'ok' })));
    const { user } = renderWithProviders(<ResetPasswordPage />, { withAuth: false });

    await user.type(screen.getByLabelText('Nueva contraseña'), 'Password2026!');
    await user.type(screen.getByLabelText('Repite la contraseña'), 'Password2026!');
    await user.click(screen.getByRole('button', { name: /Guardar contraseña/ }));

    expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument();
  });

  it('permite alternar la visibilidad de la contraseña', async () => {
    setSearchParams({ token: 'tok-1' });
    const { user } = renderWithProviders(<ResetPasswordPage />, { withAuth: false });
    const pass = screen.getByLabelText('Nueva contraseña') as HTMLInputElement;
    expect(pass.type).toBe('password');

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(pass.type).toBe('text');
  });

  it('muestra el error del backend (token expirado)', async () => {
    setSearchParams({ token: 'tok-viejo' });
    server.use(
      http.post(`${API}/auth/reset-password`, () =>
        HttpResponse.json({ message: 'El enlace expiró' }, { status: 400 }),
      ),
    );
    const { user } = renderWithProviders(<ResetPasswordPage />, { withAuth: false });

    await user.type(screen.getByLabelText('Nueva contraseña'), 'Password2026!');
    await user.type(screen.getByLabelText('Repite la contraseña'), 'Password2026!');
    await user.click(screen.getByRole('button', { name: /Guardar contraseña/ }));

    expect(await screen.findByText('El enlace expiró')).toBeInTheDocument();
  });
});
