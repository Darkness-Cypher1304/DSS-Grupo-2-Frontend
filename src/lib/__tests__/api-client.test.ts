import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import {
  api,
  setAccessToken,
  getAccessToken,
  onAuthChange,
  apiGet,
  apiPost,
} from '@/lib/api-client';

// ---------------------------------------------------------------------------
// UNIT TESTS — gestión del access token en memoria
// (no toca red ni axios: lógica de estado pura)
// ---------------------------------------------------------------------------
describe('api-client · gestión del token en memoria', () => {
  beforeEach(() => {
    setAccessToken(null); // estado limpio antes de cada test
  });

  it('getAccessToken devuelve null al inicio', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('setAccessToken guarda el token y getAccessToken lo recupera', () => {
    // ARRANGE / ACT
    setAccessToken('token-abc');
    // ASSERT
    expect(getAccessToken()).toBe('token-abc');
  });

  it('onAuthChange notifica a los listeners cuando cambia el token', () => {
    // ARRANGE
    const recibidos: Array<string | null> = [];
    const unsubscribe = onAuthChange((t) => recibidos.push(t));

    // ACT
    setAccessToken('nuevo');

    // ASSERT
    expect(recibidos).toEqual(['nuevo']);

    // ACT — tras desuscribirse ya no debe recibir cambios
    unsubscribe();
    setAccessToken('otro');

    // ASSERT
    expect(recibidos).toEqual(['nuevo']);
  });
});

// ---------------------------------------------------------------------------
// UNIT TESTS (con mock) — desempaquetado de respuestas: res.data.data
// Simula el TransformInterceptor del backend usando jest.spyOn sobre `api`.
// ---------------------------------------------------------------------------
describe('api-client · helpers que desempaquetan .data.data', () => {
  it('apiGet devuelve res.data.data', async () => {
    // ARRANGE
    const spy = jest.spyOn(api, 'get').mockResolvedValue({
      data: { data: { id: '1', email: 'ana@test.com' } },
    } as never);

    // ACT
    const result = await apiGet<{ id: string; email: string }>('/users/me');

    // ASSERT
    expect(spy).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual({ id: '1', email: 'ana@test.com' });

    spy.mockRestore();
  });

  it('apiPost reenvía el body y devuelve data.data', async () => {
    // ARRANGE
    const spy = jest.spyOn(api, 'post').mockResolvedValue({
      data: { data: { ok: true } },
    } as never);

    // ACT
    const result = await apiPost<{ ok: boolean }>('/auth/login', {
      email: 'x@test.com',
    });

    // ASSERT
    expect(spy).toHaveBeenCalledWith('/auth/login', { email: 'x@test.com' });
    expect(result).toEqual({ ok: true });

    spy.mockRestore();
  });
});
