import { describe, it, expect } from '@jest/globals';

import { apiGet } from '@/lib/api-client';

// ---------------------------------------------------------------------------
// SMOKE — valida la toolchain de integración: axios (adaptador XHR de jsdom)
// interceptado por MSW, y el desempaquetado de `{ data }` del backend.
// ---------------------------------------------------------------------------
describe('MSW ⇄ axios (smoke)', () => {
  it('apiGet resuelve data.data desde el handler simulado', async () => {
    const res = await apiGet<{ ok: boolean }>('/__smoke__');
    expect(res).toEqual({ ok: true });
  });
});
