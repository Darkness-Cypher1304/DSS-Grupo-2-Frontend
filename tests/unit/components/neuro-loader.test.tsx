import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';

import { NeuroLoader } from '@/components/neuro-loader';
import { makeMediaQueryList } from '../../helpers/dom';

// ---------------------------------------------------------------------------
// UNIT — NeuroLoader: overlay de marca con mensaje(s) y respeto a reduced-motion
// ---------------------------------------------------------------------------
describe('NeuroLoader', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('muestra el mensaje por defecto y el wordmark', () => {
    render(<NeuroLoader />);
    expect(screen.getByText('NeuroAlert')).toBeInTheDocument();
    expect(screen.getByText('Preparando tu espacio…')).toBeInTheDocument();
  });

  it('muestra el mensaje simple recibido', () => {
    render(<NeuroLoader message="Entrando…" />);
    expect(screen.getByText('Entrando…')).toBeInTheDocument();
  });

  it('cicla la secuencia de mensajes tras el intervalo', () => {
    jest.useFakeTimers();
    render(<NeuroLoader messages={['Uno', 'Dos']} />);

    expect(screen.getByText('Uno')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1600);
    });

    expect(screen.getByText('Dos')).toBeInTheDocument();
  });

  it('con prefers-reduced-motion no cicla: se queda en el primer mensaje', () => {
    jest.mocked(window.matchMedia).mockReturnValueOnce(makeMediaQueryList(true));
    jest.useFakeTimers();
    render(<NeuroLoader messages={['Primero', 'Segundo']} />);

    act(() => {
      jest.advanceTimersByTime(3200);
    });

    expect(screen.getByText('Primero')).toBeInTheDocument();
    expect(screen.queryByText('Segundo')).not.toBeInTheDocument();
  });

  it('aplica la clase inline cuando fullscreen es false', () => {
    const { container } = render(<NeuroLoader fullscreen={false} />);
    expect(container.querySelector('.neuro-loader')).toHaveClass('is-inline');
  });
});
