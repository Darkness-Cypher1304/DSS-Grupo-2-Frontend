import { describe, it, expect } from '@jest/globals';
import { http, HttpResponse } from 'msw';

import RegisterPage from '@/app/(auth)/register/page';
import { renderWithProviders, screen } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';

// ---------------------------------------------------------------------------
// INTEGRATION — /register: validación (Zod), fuerza de contraseña, éxito y error
// ---------------------------------------------------------------------------
async function fillValid(user: ReturnType<typeof renderWithProviders>['user']) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Ana Torres');
  await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com');
  await user.type(screen.getByLabelText('Contraseña'), 'Password2026!');
  await user.type(screen.getByLabelText('Confirma tu contraseña'), 'Password2026!');
}

describe('RegisterPage', () => {
  it('muestra errores de validación con campos vacíos', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));

    expect(await screen.findByText('Tu nombre es muy corto')).toBeInTheDocument();
    expect(screen.getByText('Mínimo 12 caracteres')).toBeInTheDocument();
  });

  it('valida que las contraseñas coincidan', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Torres');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Password2026!');
    await user.type(screen.getByLabelText('Confirma tu contraseña'), 'Otra-cosa-123');
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('muestra el indicador de fuerza de contraseña al escribir', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText('Contraseña'), 'Password2026!');

    expect(await screen.findByText(/Fuerza:/)).toBeInTheDocument();
  });

  it('registra con datos válidos y muestra la confirmación', async () => {
    server.use(
      http.post(`${API}/auth/register`, () =>
        wrap({ message: 'Revisa tu correo para verificar tu cuenta' }),
      ),
    );
    const { user } = renderWithProviders(<RegisterPage />);

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));

    expect(await screen.findByText('¡Listo!')).toBeInTheDocument();
    expect(
      screen.getByText('Revisa tu correo para verificar tu cuenta'),
    ).toBeInTheDocument();
  });

  it('muestra el error del servidor (mensaje en arreglo) unido con separador', async () => {
    server.use(
      http.post(`${API}/auth/register`, () =>
        HttpResponse.json({ message: ['Correo ya registrado', 'Intenta iniciar sesión'] }, { status: 400 }),
      ),
    );
    const { user } = renderWithProviders(<RegisterPage />);

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));

    expect(
      await screen.findByText('Correo ya registrado · Intenta iniciar sesión'),
    ).toBeInTheDocument();
  });
});
