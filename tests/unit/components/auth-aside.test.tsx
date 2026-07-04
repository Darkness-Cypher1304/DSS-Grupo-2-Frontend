import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { AuthAside } from '@/components/auth-aside';

// ---------------------------------------------------------------------------
// UNIT — AuthAside: panel editorial parametrizable (server component puro)
// ---------------------------------------------------------------------------
describe('AuthAside', () => {
  it('renderiza la cita y el caption recibidos', () => {
    // ARRANGE / ACT
    render(<AuthAside quote="La detección temprana importa" caption="Equipo clínico" />);

    // ASSERT
    expect(screen.getByText('La detección temprana importa')).toBeInTheDocument();
    expect(screen.getByText('Equipo clínico')).toBeInTheDocument();
  });

  it('usa eyebrow y footer por defecto cuando no se pasan', () => {
    render(<AuthAside quote="q" caption="c" />);

    expect(screen.getByText('NeuroAlert · Seguridad')).toBeInTheDocument();
    expect(screen.getByText('Tus datos están cifrados y auditados.')).toBeInTheDocument();
  });

  it('permite sobreescribir eyebrow y footer', () => {
    render(<AuthAside quote="q" caption="c" eyebrow="Personalizado" footer="Pie propio" />);

    expect(screen.getByText('Personalizado')).toBeInTheDocument();
    expect(screen.getByText('Pie propio')).toBeInTheDocument();
  });
});
