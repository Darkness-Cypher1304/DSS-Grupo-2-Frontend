import { describe, it, expect } from '@jest/globals';

import { cn, formatDateTime } from '@/lib/utils';

// ---------------------------------------------------------------------------
// UNIT TESTS — cn(): merge de clases Tailwind (función pura, sin dependencias)
// ---------------------------------------------------------------------------
describe('cn (merge de clases Tailwind)', () => {
  it('une varias clases en un solo string', () => {
    // ARRANGE / ACT
    const result = cn('px-2', 'py-1');
    // ASSERT
    expect(result).toBe('px-2 py-1');
  });

  it('resuelve conflictos de Tailwind quedándose con la última clase', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignora valores falsy (clases condicionales)', () => {
    expect(cn('text-sm', false, null, undefined, 'font-bold')).toBe(
      'text-sm font-bold',
    );
  });

  it('soporta el formato objeto { clase: condicion }', () => {
    expect(cn('base', { hidden: false, block: true })).toBe('base block');
  });
});

// ---------------------------------------------------------------------------
// UNIT TESTS — formatDateTime(): fecha+hora es-PE, robusto ante entradas malas
// ---------------------------------------------------------------------------
describe('formatDateTime (fecha + hora)', () => {
  it('devuelve "" para entradas vacías o nulas', () => {
    expect(formatDateTime('')).toBe('');
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime(undefined)).toBe('');
  });

  it('devuelve "" para una fecha inválida', () => {
    expect(formatDateTime('no-es-una-fecha')).toBe('');
  });

  it('incluye el año y la hora para una fecha ISO válida', () => {
    const out = formatDateTime('2026-06-30T14:05:00.000Z');
    // No fijamos el formato exacto (depende del locale/zona del runtime), pero
    // debe ser un string no vacío que contenga el año y los minutos.
    expect(out).not.toBe('');
    expect(out).toContain('2026');
    expect(out).toMatch(/\d{1,2}:\d{2}/);
  });
});
