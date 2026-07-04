// ============================================================================
// Helpers de DOM para tests
// ============================================================================
import { jest } from '@jest/globals';

/** Construye un MediaQueryList compatible para stubear window.matchMedia. */
export function makeMediaQueryList(matches: boolean, query = ''): MediaQueryList {
  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(() => true),
  } as unknown as MediaQueryList;
}
