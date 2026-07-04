// ============================================================================
// Doble de `next/navigation` (App Router) para jsdom
// ----------------------------------------------------------------------------
// jsdom no monta el AppRouterContext, así que los hooks reales de navegación
// lanzarían. Exponemos dobles controlables: `router` con espías (push/replace…)
// y unos `searchParams` ajustables por test con `setSearchParams`.
//
// Importante: este archivo es el destino del `moduleNameMapper` de Jest para
// `next/navigation`. Los tests deben importar `router`/`setSearchParams`
// DIRECTAMENTE desde esta ruta para compartir la MISMA instancia que ve el
// componente bajo prueba.
// ============================================================================
import { jest } from '@jest/globals';

export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

let searchParams = new URLSearchParams();
let routeParams: Record<string, string> = {};
let pathname = '/';

/** Fija los query params que devolverá `useSearchParams()` en el test actual. */
export function setSearchParams(init?: string | Record<string, string>): void {
  searchParams = new URLSearchParams(init);
}

/** Fija los params dinámicos de ruta (`[id]`, `[slug]`…) del test actual. */
export function setParams(params: Record<string, string>): void {
  routeParams = params;
}

/** Fija el pathname que devolverá `usePathname()`. */
export function setPathname(path: string): void {
  pathname = path;
}

/** Restablece router y params. Se llama en cada `afterEach` (jest.setup.ts). */
export function resetNavigation(): void {
  router.push.mockReset();
  router.replace.mockReset();
  router.back.mockReset();
  router.forward.mockReset();
  router.refresh.mockReset();
  router.prefetch.mockReset();
  searchParams = new URLSearchParams();
  routeParams = {};
  pathname = '/';
}

export const useRouter = () => router;
export const useSearchParams = () => searchParams;
export const usePathname = () => pathname;
export const useParams = () => routeParams;
export const redirect = jest.fn();
export const notFound = jest.fn();
