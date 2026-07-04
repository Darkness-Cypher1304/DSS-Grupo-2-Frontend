import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { PublicHeader, PublicFooter } from '@/components/public-chrome';

// ---------------------------------------------------------------------------
// UNIT — PublicHeader / PublicFooter: navegación pública compartida
// ---------------------------------------------------------------------------
describe('PublicHeader', () => {
  it('expone los enlaces de navegación y las CTAs de sesión', () => {
    render(<PublicHeader />);

    expect(screen.getByRole('link', { name: 'Recursos' })).toHaveAttribute('href', '/articles');
    expect(screen.getByRole('link', { name: 'Cómo funciona' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Especialistas' })).toHaveAttribute(
      'href',
      '/specialists',
    );
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /Crear cuenta/ })).toHaveAttribute('href', '/register');
  });
});

describe('PublicFooter', () => {
  it('incluye el aviso de no-diagnóstico y el año', () => {
    render(<PublicFooter />);

    expect(screen.getByText(/Plataforma educativa sin fines diagnósticos/)).toBeInTheDocument();
    expect(screen.getByText(/© 2026 NeuroAlert/)).toBeInTheDocument();
  });
});
