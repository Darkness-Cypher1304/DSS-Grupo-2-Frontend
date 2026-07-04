// ============================================================================
// renderWithProviders — helper de render para tests de integración
// ----------------------------------------------------------------------------
// Envuelve el árbol con los mismos providers que la app real: QueryClient de
// React Query y, opcionalmente, el AuthProvider. Cada test recibe además un
// `user` de user-event ya inicializado y el `queryClient` para inspección.
//
// El QueryClient de test desactiva reintentos y caché (F.I.R.S.T.: tests rápidos
// y deterministas).
// ============================================================================
import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/lib/auth-context';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Envolver con AuthProvider (default: true, como en producción). */
  withAuth?: boolean;
  /** QueryClient a reutilizar (default: uno nuevo por render). */
  queryClient?: QueryClient;
}

export type RenderWithProvidersResult = RenderResult & {
  user: ReturnType<typeof userEvent.setup>;
  queryClient: QueryClient;
};

export function renderWithProviders(
  ui: ReactElement,
  { withAuth = true, queryClient = createTestQueryClient(), ...options }: ProviderOptions = {},
): RenderWithProvidersResult {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {withAuth ? <AuthProvider>{children}</AuthProvider> : children}
      </QueryClientProvider>
    );
  }

  const result = render(ui, { wrapper: Wrapper, ...options });
  return { ...result, user: userEvent.setup(), queryClient };
}

// Re-export de utilidades de Testing Library para un único punto de import.
export * from '@testing-library/react';
export { userEvent };
