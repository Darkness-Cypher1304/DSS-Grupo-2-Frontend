// ============================================================================
// Tipos de los matchers de jest-dom para el `expect` de @jest/globals
// ----------------------------------------------------------------------------
// jest-dom augmenta el namespace global `jest`, pero nuestros tests importan
// `expect` desde `@jest/globals` (cuyos matchers vienen del paquete `expect`).
// Aquí extendemos la interfaz `Matchers` de `expect` con los matchers de
// jest-dom (toBeInTheDocument, toHaveAttribute, toHaveTextContent, …).
// ============================================================================
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'expect' {
  interface Matchers<R extends void | Promise<void>, T = unknown>
    extends TestingLibraryMatchers<unknown, R> {}
}
