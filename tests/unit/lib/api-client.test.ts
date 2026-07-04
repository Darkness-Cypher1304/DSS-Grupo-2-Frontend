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
// UNIT — gestión del access token en memoria (estado puro, sin red)
// ---------------------------------------------------------------------------
describe('api-client · gestión del token en memoria', () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  it('getAccessToken devuelve null al inicio', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('setAccessToken guarda el token y getAccessToken lo recupera', () => {
    setAccessToken('token-abc');
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

    // ACT — tras desuscribirse ya no recibe cambios
    unsubscribe();
    setAccessToken('otro');

    // ASSERT
    expect(recibidos).toEqual(['nuevo']);
  });
});

// ---------------------------------------------------------------------------
// UNIT (con mock) — helpers que desempaquetan res.data.data
// ---------------------------------------------------------------------------
describe('api-client · helpers que desempaquetan .data.data', () => {
  beforeEach(() => {
    setAccessToken(null);
    jest.restoreAllMocks();
  });

  it('apiGet devuelve res.data.data', async () => {
    const spy = jest.spyOn(api, 'get').mockResolvedValue({
      data: { data: { id: '1', email: 'ana@test.com' } },
    } as never);

    const result = await apiGet<{ id: string; email: string }>('/users/me');

    expect(spy).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual({ id: '1', email: 'ana@test.com' });
  });

  it('apiPost reenvía el body y devuelve data.data', async () => {
    const spy = jest.spyOn(api, 'post').mockResolvedValue({
      data: { data: { ok: true } },
    } as never);

    const result = await apiPost<{ ok: boolean }>('/auth/login', { email: 'x@test.com' });

    expect(spy).toHaveBeenCalledWith('/auth/login', { email: 'x@test.com' });
    expect(result).toEqual({ ok: true });
  });

  it('apiPatch reenvía el body y devuelve data.data', async () => {
    const spy = jest.spyOn(api, 'patch').mockResolvedValue({
      data: { data: { updated: true } },
    } as never);

    const result = await apiPatch<{ updated: boolean }>('/users/1', { fullName: 'Ana' });

    expect(spy).toHaveBeenCalledWith('/users/1', { fullName: 'Ana' });
    expect(result).toEqual({ updated: true });
  });

  it('apiDelete devuelve data.data', async () => {
    const spy = jest.spyOn(api, 'delete').mockResolvedValue({
      data: { data: { deleted: true } },
    } as never);

    const result = await apiDelete<{ deleted: boolean }>('/users/1');

    expect(spy).toHaveBeenCalledWith('/users/1');
    expect(result).toEqual({ deleted: true });
  });
});

// ---------------------------------------------------------------------------
// UNIT (adapter) — interceptores de axios: Bearer + refresh automático en 401
// Reemplazamos el ADAPTER de la instancia `api` para ejercitar los interceptores
// de verdad sin abrir red. El refresh interno usa axios.post → se simula.
// ---------------------------------------------------------------------------
describe('api-client · interceptores (Bearer + refresh en 401)', () => {
  const adapterOriginal = api.defaults.adapter;

  beforeEach(() => {
    setAccessToken(null);
    jest.restoreAllMocks();
    api.defaults.adapter = adapterOriginal;
  });

  it('el interceptor de request añade Authorization cuando hay token', async () => {
    setAccessToken('tok-123');
    const adapter = jest.fn(
      async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> =>
        ({ data: { data: 'ok' }, status: 200, statusText: 'OK', headers: {}, config }) as AxiosResponse,
    );
    api.defaults.adapter = adapter as AxiosAdapter;

    try {
      const result = await apiGet<string>('/protegido');
      expect(result).toBe('ok');
      const enviado = adapter.mock.calls[0][0];
      const headers = enviado.headers as unknown as Record<string, unknown>;
      expect(headers.Authorization).toBe('Bearer tok-123');
    } finally {
      api.defaults.adapter = adapterOriginal;
    }
  });

  it('sin token NO añade el header Authorization', async () => {
    const adapter = jest.fn(
      async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> =>
        ({ data: { data: 'ok' }, status: 200, statusText: 'OK', headers: {}, config }) as AxiosResponse,
    );
    api.defaults.adapter = adapter as AxiosAdapter;

    try {
      await apiGet('/publico');
      const enviado = adapter.mock.calls[0][0];
      const headers = enviado.headers as unknown as Record<string, unknown>;
      expect(headers.Authorization).toBeUndefined();
    } finally {
      api.defaults.adapter = adapterOriginal;
    }
  });

  it('ante un 401 refresca el token y reintenta la petición original', async () => {
    setAccessToken('expirado');

    const postSpy = jest
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { data: { accessToken: 'token-fresco' } } } as never);

    let llamadas = 0;
    const adapter = jest.fn(
      async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        llamadas += 1;
        if (llamadas === 1) {
          return Promise.reject({
            isAxiosError: true,
            config,
            response: { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config },
            message: 'Request failed with status code 401',
          });
        }
        return { data: { data: { secreto: 42 } }, status: 200, statusText: 'OK', headers: {}, config } as AxiosResponse;
      },
    );
    api.defaults.adapter = adapter as AxiosAdapter;

    try {
      const result = await apiGet<{ secreto: number }>('/protegido');
      expect(result).toEqual({ secreto: 42 });
      expect(postSpy).toHaveBeenCalled();
      expect(adapter).toHaveBeenCalledTimes(2);
      expect(getAccessToken()).toBe('token-fresco');
    } finally {
      api.defaults.adapter = adapterOriginal;
    }
  });

  it('un 401 en /auth/login NO dispara refresh (evita bucle)', async () => {
    const postSpy = jest.spyOn(axios, 'post');
    const adapter = jest.fn(
      async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> =>
        Promise.reject({
          isAxiosError: true,
          config,
          response: { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config },
          message: '401',
        }),
    );
    api.defaults.adapter = adapter as AxiosAdapter;

    try {
      await expect(apiPost('/auth/login', { email: 'x' })).rejects.toBeDefined();
      expect(postSpy).not.toHaveBeenCalled(); // no hubo refresh
      expect(adapter).toHaveBeenCalledTimes(1); // sin reintento
    } finally {
      api.defaults.adapter = adapterOriginal;
    }
  });

  it('si el refresh falla, limpia el token y propaga el error', async () => {
    setAccessToken('expirado');
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('refresh 401'));

    const adapter = jest.fn(
      async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> =>
        Promise.reject({
          isAxiosError: true,
          config,
          response: { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config },
          message: '401',
        }),
    );
    api.defaults.adapter = adapter as AxiosAdapter;

    try {
      await expect(apiGet('/protegido')).rejects.toBeDefined();
      expect(getAccessToken()).toBeNull();
    } finally {
      api.defaults.adapter = adapterOriginal;
    }
  });
});
