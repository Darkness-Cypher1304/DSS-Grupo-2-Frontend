import { describe, it, expect, jest } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import LoginPage from '@/app/(auth)/login/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { router, setSearchParams } from '../../mocks/next-navigation';
import { makeLoginResponse } from '../../fixtures/users';

// ---------------------------------------------------------------------------
// INTEGRATION — /login: validación, autenticación, redirección por rol y
// reenvío de verificación. (react-hook-form + Zod + AuthContext + MSW)
// ---------------------------------------------------------------------------
describe('LoginPage', () => {
  it('muestra errores de validación con campos vacíos', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Correo electrónico inválido')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument();
  });

  it('con credenciales válidas autentica y redirige al inicio por rol (PARENT → /dashboard)', async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        wrap(makeLoginResponse({}, { role: 'PARENT' })),
      ),
    );
    const { user } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'padre@neuroalert.pe');
    await user.type(screen.getByLabelText('Contraseña'), 'Password2026!');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/dashboard'));
  });

  it('honra ?redirect= cuando la ruta corresponde al rol', async () => {
    setSearchParams({ redirect: '/resources' });
    server.use(
      http.post(`${API}/auth/login`, () => wrap(makeLoginResponse({}, { role: 'PARENT' }))),
    );
    const { user } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'padre@neuroalert.pe');
    await user.type(screen.getByLabelText('Contraseña'), 'Password2026!');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/resources'));
  });

  it('muestra el error del servidor cuando las credenciales fallan', async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ message: 'Credenciales inválidas' }, { status: 401 }),
      ),
    );
    const { user } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'padre@neuroalert.pe');
    await user.type(screen.getByLabelText('Contraseña'), 'mala-clave');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('ofrece reenviar verificación si la cuenta no está verificada', async () => {
    const resend = jest.fn(() => wrap({ message: 'ok' }));
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ message: 'Debes verificar tu correo antes de entrar' }, { status: 401 }),
      ),
      http.post(`${API}/auth/resend-verification`, resend),
    );
    const { user } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'padre@neuroalert.pe');
    await user.type(screen.getByLabelText('Contraseña'), 'Password2026!');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    const resendBtn = await screen.findByRole('button', {
      name: /Reenviar correo de verificación/,
    });
    await user.click(resendBtn);

    await waitFor(() => expect(resend).toHaveBeenCalled());
    expect(await screen.findByText(/Te reenviamos el enlace/)).toBeInTheDocument();
  });

  const roleHomes: Array<['SPECIALIST' | 'ADMIN', string]> = [
    ['SPECIALIST', '/specialist'],
    ['ADMIN', '/admin'],
  ];
  it.each(roleHomes)('redirige al inicio de rol %s → %s', async (role, home) => {
    server.use(http.post(`${API}/auth/login`, () => wrap(makeLoginResponse({}, { role }))));
    const { user } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'x@neuroalert.pe');
    await user.type(screen.getByLabelText('Contraseña'), 'Password2026!');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith(home));
  });

  it('ignora un ?redirect= que no corresponde al rol (cae al inicio por rol)', async () => {
    setSearchParams({ redirect: '/admin' }); // un PARENT no puede ir a /admin
    server.use(http.post(`${API}/auth/login`, () => wrap(makeLoginResponse({}, { role: 'PARENT' }))));
    const { user } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'padre@neuroalert.pe');
    await user.type(screen.getByLabelText('Contraseña'), 'Password2026!');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/dashboard'));
  });

  it('permite alternar la visibilidad de la contraseña', async () => {
    const { user } = renderWithProviders(<LoginPage />);
    const password = screen.getByLabelText('Contraseña') as HTMLInputElement;
    expect(password.type).toBe('password');

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));

    expect(password.type).toBe('text');
  });
});
