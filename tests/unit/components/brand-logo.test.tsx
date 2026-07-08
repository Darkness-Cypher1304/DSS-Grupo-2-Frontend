import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { BrandLogo, BrandGlyph } from '@/components/brand-logo';

// ---------------------------------------------------------------------------
// UNIT — BrandLogo: marca NeuroAlert (presentacional, sin lógica)
// Conserva el diseño base (cerebro en cuadro redondeado); solo cubrimos las
// variantes visuales para blindar el componente y el coverage gate.
// ---------------------------------------------------------------------------
describe('BrandLogo', () => {
  it('muestra el wordmark "NeuroAlert" por defecto', () => {
    render(<BrandLogo />);
    expect(screen.getByText('NeuroAlert')).toBeInTheDocument();
  });

  it('oculta el wordmark cuando withWordmark es false', () => {
    render(<BrandLogo withWordmark={false} />);
    expect(screen.queryByText('NeuroAlert')).not.toBeInTheDocument();
  });

  it('usa texto claro sobre fondo oscuro (onDark)', () => {
    render(<BrandLogo onDark />);
    expect(screen.getByText('NeuroAlert')).toHaveClass('text-bone-50');
  });

  it('acepta un tamaño grande y clases extra en el contenedor', () => {
    const { container } = render(<BrandLogo size="lg" className="mb-2" />);
    expect(container.firstChild).toHaveClass('mb-2');
  });
});

describe('BrandGlyph', () => {
  it('renderiza solo el glifo, sin wordmark', () => {
    render(<BrandGlyph size="sm" />);
    expect(screen.queryByText('NeuroAlert')).not.toBeInTheDocument();
  });
});
