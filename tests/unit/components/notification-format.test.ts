import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { formatRelative } from '@/components/notification-bell';

// ---------------------------------------------------------------------------
// UNIT — formatRelative(): tiempo relativo en español (función pura, ramas)
// Fijamos "ahora" para que el test sea determinista (F.I.R.S.T.: Repeatable).
// ---------------------------------------------------------------------------
describe('formatRelative', () => {
  const NOW = new Date('2026-07-04T12:00:00.000Z').getTime();

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const haceMs = (ms: number) => new Date(NOW - ms).toISOString();

  it('devuelve "" ante una fecha inválida', () => {
    expect(formatRelative('no-es-fecha')).toBe('');
  });

  it('"hace un momento" para menos de un minuto', () => {
    expect(formatRelative(haceMs(30 * 1000))).toBe('hace un momento');
  });

  it('minutos para menos de una hora', () => {
    expect(formatRelative(haceMs(5 * 60 * 1000))).toBe('hace 5 min');
  });

  it('horas para menos de un día', () => {
    expect(formatRelative(haceMs(3 * 60 * 60 * 1000))).toBe('hace 3 h');
  });

  it('días para menos de una semana', () => {
    expect(formatRelative(haceMs(2 * 24 * 60 * 60 * 1000))).toBe('hace 2 d');
  });

  it('fecha corta para una semana o más', () => {
    const out = formatRelative(haceMs(10 * 24 * 60 * 60 * 1000));
    // Formato es-PE "24 jun" (depende de zona); validamos que no sea relativo.
    expect(out).not.toMatch(/hace/);
    expect(out).toMatch(/\d/);
  });
});
