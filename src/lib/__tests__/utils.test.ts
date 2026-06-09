import { describe, it, expect } from '@jest/globals';

import { cn } from '@/lib/utils';

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
