import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { Skeleton, SkeletonCard, SkeletonList } from '@/components/skeleton';

// ---------------------------------------------------------------------------
// UNIT — Skeleton: placeholders de carga (presentacionales)
// ---------------------------------------------------------------------------
describe('Skeleton', () => {
  it('aplica la clase base y las clases extra', () => {
    const { container } = render(<Skeleton className="h-5 w-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('skeleton');
    expect(el).toHaveClass('h-5', 'w-32');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('SkeletonList', () => {
  it('renderiza 3 tarjetas por defecto con rol de estado accesible', () => {
    render(<SkeletonList />);
    const status = screen.getByRole('status', { name: 'Cargando…' });
    expect(status).toBeInTheDocument();
    expect(status.querySelectorAll('.card')).toHaveLength(3);
  });

  it('respeta el count recibido', () => {
    render(<SkeletonList count={5} />);
    expect(screen.getByRole('status').querySelectorAll('.card')).toHaveLength(5);
  });
});

describe('SkeletonCard', () => {
  it('renderiza una tarjeta oculta a lectores de pantalla', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.card')).toHaveAttribute('aria-hidden', 'true');
  });
});
