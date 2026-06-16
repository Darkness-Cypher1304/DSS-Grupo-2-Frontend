import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios, {
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import {
  api,
  setAccessToken,
  getAccessToken,
  onAuthChange,
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
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
  beforeEach(() => {
    setAccessToken(null);
    jest.restoreAllMocks();
  });

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
  });

  it('apiPatch reenvía el body y devuelve data.data', async () => {
    // ARRANGE
    const spy = jest.spyOn(api, 'patch').mockResolvedValue({
      data: { data: { updated: true } },
    } as never);

    // ACT
    const result = await apiPatch<{ updated: boolean }>('/users/1', {
      fullName: 'Ana',
    });

    // ASSERT
    expect(spy).toHaveBeenCalledWith('/users/1', { fullName: 'Ana' });
    expect(result).toEqual({ updated: true });
  });

  it('apiDelete devuelve data.data', async () => {
    // ARRANGE
    const spy = jest.spyOn(api, 'delete').mockResolvedValue({
      data: { data: { deleted: true } },
    } as never);

    // ACT
    const result = await apiDelete<{ deleted: boolean }>('/users/1');

    // ASSERT
    expect(spy).toHaveBeenCalledWith('/users/1');
    expect(result).toEqual({ deleted: true });
  });
});

// ---------------------------------------------------------------------------
// INTEGRATION-STYLE UNIT TESTS — interceptores de axios
// Reemplazamos el ADAPTER de la instancia `api` para ejercitar de verdad los
// interceptores (request: Bearer / response: refresh automático en 401) sin
// abrir red real. El refresh interno usa axios.post -> se simula con spyOn.
// ---------------------------------------------------------------------------
describe('api-client · interceptores (Bearer + refresh en 401)', () => {
  // Guardamos el adapter original para restaurarlo siempre.
  const adapterOriginal = api.defaults.adapter;

  beforeEach(() => {
    setAccessToken(null);
    jest.restoreAllMocks();
    api.defaults.adapter = adapterOriginal;
  });

  it('el interceptor de request añade Authorization cuando hay token', async () => {
    // ARRANGE
    setAccessToken('tok-123');
    const adapter = jest.fn(
      async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> =>
        ({
          data: { data: 'ok' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }) as AxiosResponse,
    );
    api.defaults.adapter = adapter as AxiosAdapter;

    try {
      // ACT
      const result = await apiGet<string>('/protegido');

      // ASSERT
      expect(result).toBe('ok');
      const enviado = adapter.mock.calls[0][0];
      const headers = enviado.headers as unknown as Record<string, unknown>;
      expect(headers.Authorization).toBe('Bearer tok-123');
    } finally {
      api.defaults.adapter = adapterOriginal;
    }
  });

  it('sin token NO añade el header Authorization', async () => {
    // ARRANGE (sin setAccessToken -> null por beforeEach)
    const adapter = jest.fn(
      async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> =>
        ({
          data: { data: 'ok' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }) as AxiosResponse,
    );
    api.defaults.adapter = adapter as AxiosAdapter;

    try {
      // ACT
      await apiGet('/publico');

      // ASSERT
      const enviado = adapter.mock.calls[0][0];
      const headers = enviado.headers as unknown as Record<string, unknown>;
      expect(headers.Authorization).toBeUndefined();
    } finally {
      api.defaults.adapter = adapterOriginal;
    }
  });

  it('ante un 401 refresca el token y reintenta la petición original', async () => {
    // ARRANGE
    setAccessToken('expirado');

    // El refresh interno usa axios.post directamente -> lo simulamos.
    const postSpy = jest
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { data: { accessToken: 'token-fresco' } } } as never);

    let llamadas = 0;
    const adapter = jest.fn(
      async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        llamadas += 1;
        if (llamadas === 1) {
          // 1ª vez: el backend responde 401 (token expirado)
          return Promise.reject({
            isAxiosError: true,
            config,
            response: {
              status: 401,
              data: {},
              statusText: 'Unauthorized',
              headers: {},
              config,
            },
            message: 'Request failed with status code 401',
          });
        }
        // Reintento (ya con token fresco): 200
        return {
          data: { data: { secreto: 42 } },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        } as AxiosResponse;
      },
    );
    api.defaults.adapter = adapter as AxiosAdapter;

    try {
      // ACT
      const result = await apiGet<{ secreto: number }>('/protegido');

      // ASSERT
      expect(result).toEqual({ secreto: 42 });
      expect(postSpy).toHaveBeenCalled(); // hubo refresh
      expect(adapter).toHaveBeenCalledTimes(2); // original + reintento
      expect(getAccessToken()).toBe('token-fresco');
    } finally {
      api.defaults.adapter = adapterOriginal;
    }
  });
});
