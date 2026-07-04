import { describe, it, expect } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

import { Providers } from '@/lib/providers';
import { useAuth } from '@/lib/auth-context';

// Consumidor mínimo: prueba que Providers monta QueryClient + AuthProvider y que
// el árbol hijo puede leer el contexto de auth sin errores.
function Child() {
  const { loading } = useAuth();
  return <span data-testid="ready">{loading ? 'cargando' : 'listo'}</span>;
}

describe('Providers', () => {
  it('renderiza a los hijos y provee el contexto de autenticación', async () => {
    render(
      <Providers>
        <Child />
      </Providers>,
    );

    expect(screen.getByTestId('ready')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('listo'));
  });
});
