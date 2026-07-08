import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';

import { Reveal, CountUp, Spotlight } from '@/components/motion';

// ---------------------------------------------------------------------------
// UNIT — motion: piezas de movimiento (presentacionales) del rediseño.
// Se mockean IntersectionObserver / matchMedia / requestAnimationFrame para
// ejercitar las ramas: degradación grácil, reduced-motion y la animación.
// ---------------------------------------------------------------------------

// IntersectionObserver controlable: guarda el callback para dispararlo a mano.
class MockIO {
  static instances: MockIO[] = [];
  cb: (entries: { isIntersecting: boolean }[], obs: unknown) => void;
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = () => [];
  constructor(cb: (entries: { isIntersecting: boolean }[], obs: unknown) => void) {
    this.cb = cb;
    MockIO.instances.push(this);
  }
  fire(isIntersecting = true) {
    act(() => this.cb([{ isIntersecting }], this));
  }
}

const originalIO = globalThis.IntersectionObserver;
const originalMatchMedia = window.matchMedia;
const originalRAF = window.requestAnimationFrame;

function setReducedMotion(reduce: boolean) {
  const noop = () => {};
  window.matchMedia = ((query: string) => ({
    matches: reduce,
    media: query,
    onchange: null,
    addEventListener: noop,
    removeEventListener: noop,
    addListener: noop,
    removeListener: noop,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  MockIO.instances = [];
  globalThis.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
  setReducedMotion(false);
  // rAF que avanza el tiempo para que la animación de CountUp termine sincrónica.
  let t = 0;
  window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    t += 5000;
    cb(t);
    return t;
  }) as unknown as typeof window.requestAnimationFrame;
});

afterEach(() => {
  globalThis.IntersectionObserver = originalIO;
  window.matchMedia = originalMatchMedia;
  window.requestAnimationFrame = originalRAF;
});

describe('Reveal', () => {
  it('renderiza el contenido y lo revela al entrar en viewport', () => {
    render(
      <Reveal>
        <span data-testid="hijo">contenido</span>
      </Reveal>,
    );
    const child = screen.getByTestId('hijo');
    const wrapper = child.parentElement as HTMLElement;
    // Armado por el layout-effect (oculto) hasta que el observer dispare.
    expect(wrapper.style.opacity).toBe('0');
    MockIO.instances[0].fire(true);
    expect(wrapper.style.opacity).toBe('1');
  });

  it('con reduced-motion queda visible sin depender del observer', () => {
    setReducedMotion(true);
    render(
      <Reveal>
        <span data-testid="hijo">contenido</span>
      </Reveal>,
    );
    const wrapper = screen.getByTestId('hijo').parentElement as HTMLElement;
    expect(wrapper.style.opacity).toBe('1');
  });
});

describe('CountUp', () => {
  it('anima de 0 al valor final al entrar en viewport', () => {
    render(<CountUp to={97.4} decimals={1} />);
    // Armado en 0 por el layout-effect.
    expect(screen.getByText('0.0')).toBeInTheDocument();
    MockIO.instances[0].fire(true);
    expect(screen.getByText('97.4')).toBeInTheDocument();
  });

  it('con reduced-motion muestra el valor final directamente', () => {
    setReducedMotion(true);
    render(<CountUp to={204} />);
    expect(screen.getByText('204')).toBeInTheDocument();
  });
});

describe('Spotlight', () => {
  it('renderiza un elemento decorativo y reacciona al puntero sin fallar', () => {
    const { container } = render(
      <div style={{ position: 'relative' }}>
        <Spotlight />
      </div>,
    );
    const glow = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(glow).toBeInTheDocument();
    // Mueve el puntero sobre el contenedor padre: no debe lanzar.
    act(() => {
      glow.parentElement?.dispatchEvent(
        new MouseEvent('pointermove', { clientX: 10, clientY: 10, bubbles: true }),
      );
    });
    expect(glow).toBeInTheDocument();
  });
});
