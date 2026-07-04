import { describe, it, expect, jest } from '@jest/globals';
import { http, HttpResponse } from 'msw';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { getAccessToken } from '@/lib/api-client';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';
import { makeLoginResponse } from '../../fixtures/users';

// Sonda que expone el estado y las acciones del contexto para los tests.
function Probe() {
  const { user, loading, login, logout, register, refresh } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : 'invitado'}</span>
      <button onClick={() => void login('padre@neuroalert.pe', 'pw').catch(() => {})}>login</button>
      <button onClick={() => void logout()}>logout</button>
      <button onClick={() => void refresh()}>refresh</button>
      <button
        onClick={() =>
          void register({ email: 'x@y.pe', password: 'pw', fullName: 'X' }).catch(() => {})
        }
      >
        register
      </button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

describe('AuthContext', () => {
  it('sin sesión activa (refresh 401) queda como invitado y deja de cargar', async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('invitado');
  });

  it('retoma la sesión al montar si el refresh devuelve usuario', async () => {
    server.use(
      http.post(`${API}/auth/refresh`, () =>
        wrap(makeLoginResponse({}, { email: 'ana@neuroalert.pe' })),
      ),
    );

    renderAuth();

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('ana@neuroalert.pe'),
    );
    expect(getAccessToken()).toBe('access-token-demo');
  });

  it('login guarda el usuario y el access token', async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        wrap(makeLoginResponse({}, { email: 'padre@neuroalert.pe' })),
      ),
    );
    const user = userEvent.setup();
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await user.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('padre@neuroalert.pe'),
    );
  });

  it('logout limpia el usuario aunque la petición al backend responda', async () => {
    server.use(
      http.post(`${API}/auth/refresh`, () => wrap(makeLoginResponse())),
      http.post(`${API}/auth/logout`, () => wrap({})),
    );
    const user = userEvent.setup();
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('padre@neuroalert.pe'));

    await user.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('invitado'));
  });

  it('register no autentica: solo delega en el backend', async () => {
    const spy = jest.fn(() => wrap({ message: 'Revisa tu correo' }));
    server.use(http.post(`${API}/auth/register`, spy));
    const user = userEvent.setup();
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await user.click(screen.getByRole('button', { name: 'register' }));

    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(screen.getByTestId('user')).toHaveTextContent('invitado');
  });

  it('refresh() manual actualiza el usuario cuando hay sesión', async () => {
    const user = userEvent.setup();
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('invitado'));

    server.use(
      http.post(`${API}/auth/refresh`, () =>
        wrap(makeLoginResponse({}, { email: 'nuevo@neuroalert.pe' })),
      ),
    );
    await user.click(screen.getByRole('button', { name: 'refresh' }));

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('nuevo@neuroalert.pe'),
    );
  });

  it('refresh() limpia la sesión si el backend responde 401', async () => {
    server.use(http.post(`${API}/auth/refresh`, () => wrap(makeLoginResponse())));
    const user = userEvent.setup();
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('padre@neuroalert.pe'));

    server.use(http.post(`${API}/auth/refresh`, () => new HttpResponse(null, { status: 401 })));
    await user.click(screen.getByRole('button', { name: 'refresh' }));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('invitado'));
  });

  it('useAuth lanza si se usa fuera del AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/AuthProvider/);
    consoleError.mockRestore();
  });
});
