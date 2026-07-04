// ============================================================================
// MSW · Servidor de interceptación para Node/Jest
// ----------------------------------------------------------------------------
// Intercepta las peticiones de axios (adaptador XHR de jsdom) sin abrir red real.
// El ciclo de vida (listen/reset/close) se gestiona en tests/setup/jest.setup.ts.
// ============================================================================
import { setupServer } from 'msw/node';

import { handlers } from './handlers';

export const server = setupServer(...handlers);
