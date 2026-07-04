// ============================================================================
// Setup global de Jest (setupFilesAfterEnv)
// ----------------------------------------------------------------------------
// - Matchers de jest-dom (toBeInTheDocument, toHaveTextContent, …).
// - Ciclo de vida del servidor MSW: intercepta la API en toda la suite y falla
//   ante peticiones no mockeadas (F.I.R.S.T.: detecta llamadas olvidadas).
// - Reset de la navegación (router/searchParams) entre tests.
// ============================================================================
import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, jest } from '@jest/globals';

import { resetNavigation } from '../mocks/next-navigation';
import { server } from '../mocks/server';
import { makeMediaQueryList } from '../helpers/dom';

// --- Stubs de APIs del navegador que jsdom no implementa -------------------
// Los usan componentes de marca (NeuroLoader: matchMedia), páginas que hacen
// scroll (M-CHAT: window.scrollTo) y librerías de animación/observación.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn((query: string) => makeMediaQueryList(false, query)),
  });
}

window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;
window.open = jest.fn() as unknown as typeof window.open;

// Descarga de documentos (admin): jsdom no implementa createObjectURL.
if (!URL.createObjectURL) {
  URL.createObjectURL = jest.fn(() => 'blob:mock') as unknown as typeof URL.createObjectURL;
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = jest.fn() as unknown as typeof URL.revokeObjectURL;
}

class ObserverStub {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
}
globalThis.IntersectionObserver ??= ObserverStub as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver ??= ObserverStub as unknown as typeof ResizeObserver;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  resetNavigation();
});

afterAll(() => server.close());
