import { describe, it, expect } from '@jest/globals';

import { cn, formatDateTime } from '@/lib/utils';

// ---------------------------------------------------------------------------
// UNIT — cn(): merge de clases Tailwind (función pura, sin dependencias)
// ---------------------------------------------------------------------------
describe('cn (merge de clases Tailwind)', () => {
  it('une varias clases en un solo string', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('resuelve conflictos de Tailwind quedándose con la última clase', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignora valores falsy (clases condicionales)', () => {
    expect(cn('text-sm', false, null, undefined, 'font-bold')).toBe('text-sm font-bold');
  });

  it('soporta el formato objeto { clase: condicion }', () => {
    expect(cn('base', { hidden: false, block: true })).toBe('base block');
  });

  it('aplana arrays de clases', () => {
    expect(cn(['px-2', 'py-1'], 'font-bold')).toBe('px-2 py-1 font-bold');
  });
});

// ---------------------------------------------------------------------------
// UNIT — formatDateTime(): fecha+hora es-PE, robusto ante entradas malas
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
    // El formato exacto depende del locale/zona del runtime; validamos que sea un
    // string no vacío con el año y un patrón de hora (comportamiento, no formato).
    expect(out).not.toBe('');
    expect(out).toContain('2026');
    expect(out).toMatch(/\d{1,2}:\d{2}/);
  });
});
