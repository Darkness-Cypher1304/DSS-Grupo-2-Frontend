// ============================================================================
// Configuración de Jest — NeuroAlert Frontend (Next.js + React + TypeScript)
// ----------------------------------------------------------------------------
// Usamos `next/jest`: monta el compilador SWC de Next automáticamente (respeta
// next.config.js, paths y .env) sin ts-jest ni babel.
//
// Arquitectura de tests (carpeta `tests/` hermana de `src/`):
//   - tests/unit/**         → unidades aisladas (lib, components, contexts, providers)
//   - tests/integration/**  → flujos con React Testing Library + MSW (API simulada)
//   - tests/e2e/**          → RESERVADO para Playwright (fase futura; no lo corre Jest)
//
// Un solo entorno `jsdom` para todo: la lógica pura de `lib/` corre igual bajo
// jsdom, y los componentes/flujos necesitan DOM. Separamos unit e integration por
// RUTA (scripts `test:unit` / `test:integration`), no por config duplicada.
//
// COBERTURA (Coverage Gate): el umbral del 85% se aplica cuando se corre la suite
// COMPLETA (`jest --coverage` → unit + integration juntas), de modo que las páginas
// con lógica validadas por integración también cuenten. En CI el job "Coverage
// Gate" ejecuta esa corrida combinada; los jobs "Unit"/"Integration" dan feedback
// rápido por separado (ver .github/workflows/ci-cd.yml).
// ============================================================================
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jsdom',
  // - url: mismo origen que la API por defecto (NEXT_PUBLIC_API_URL ??
  //   http://localhost:4000) → evita fricciones de "cross-origin" del XHR de
  //   jsdom cuando MSW intercepta las llamadas de axios.
  // - customExportConditions: sin esto, jsdom hace que Jest resuelva la condición
  //   "browser" de los package.json y no encuentra `msw/node` (issue conocido de
  //   MSW v2). Con [''] se usa la condición por defecto y resuelve el build Node.
  testEnvironmentOptions: {
    url: 'http://localhost:4000',
    customExportConditions: [''],
  },

  // Polyfills (fetch/Response/streams para MSW) ANTES del framework de test.
  setupFiles: ['<rootDir>/tests/setup/polyfills.ts'],
  // jest-dom + arranque/cierre del server de MSW, tras montar el framework.
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],

  // Alias "@/..." igual que tsconfig + mocks de navegación de Next (jsdom no
  // provee el AppRouterContext, así que useRouter/useSearchParams y <Link>
  // se sustituyen por dobles controlables desde los tests).
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next/navigation$': '<rootDir>/tests/mocks/next-navigation.ts',
    '^next/link$': '<rootDir>/tests/mocks/next-link.tsx',
    // react-markdown es ESM puro con un árbol grande de deps; lo stubeamos (no
    // testeamos el render de Markdown, solo que el contenido llega).
    '^react-markdown$': '<rootDir>/tests/mocks/react-markdown.tsx',
  },

  // Solo corremos unit e integration con Jest. e2e/ queda para Playwright.
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{ts,tsx}',
  ],

  clearMocks: true,

  // --------------------------------------------------------------------------
  // Superficie de cobertura = TODO el código con comportamiento.
  // Incluye lib, components y las páginas de app/ con lógica (formularios,
  // validaciones, navegación, estado, API). Las exclusiones son SOLO "glue" del
  // framework o composición estática, y están justificadas una a una:
  // --------------------------------------------------------------------------
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    'src/app/**/*.{ts,tsx}',

    // Tipos / declaraciones (no ejecutan lógica).
    '!src/**/*.d.ts',

    // Glue del App Router (composición/infra del framework, sin lógica propia).
    '!src/app/**/layout.tsx',
    '!src/app/**/template.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',

    // Server Components estáticos/compositivos o RSC async (no renderables en
    // jsdom sin runtime de RSC). Son marketing/contenido sin lógica de negocio;
    // se validan visualmente, no aportan ramas testeables:
    // Nota: los grupos de rutas llevan paréntesis LITERALES en disco -> hay que
    // escaparlos, porque micromatch trata "(auth)" como grupo de patrón.
    '!src/app/page.tsx', //                landing (marketing estático)
    '!src/app/about/page.tsx', //          contenido estático
    '!src/app/specialists/page.tsx', //    RSC async (listado desde API en server)
    '!src/app/\\(auth\\)/postular/page.tsx', //         intro estática de postulación
    '!src/app/\\(auth\\)/postular/enviado/page.tsx', // confirmación estática
    '!src/app/\\(auth\\)/register-specialist/page.tsx', // redirección/contenedor fino
  ],

  coverageDirectory: '<rootDir>/tests/reports/coverage',
  // json-summary -> totales por archivo (reporte del Job Summary);
  // json         -> coverage-final.json con detalle POR LÍNEA (patch coverage y
  //                 líneas sin cubrir en el reporte); lcov/text -> legibilidad.
  coverageReporters: ['text', 'text-summary', 'json-summary', 'json', 'lcov'],

  // Coverage Gate: mínimo aprobado por el proyecto = 85% en las 4 métricas.
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 85,
      functions: 85,
      lines: 85,
    },
  },

  // No escanear artefactos de build (evita colisiones de haste-map).
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
};

// MSW v2 y sus dependencias se publican como ESM puro; Jest ignora node_modules
// por defecto. `next/jest` ANTEPONE su propio transformIgnorePatterns (con
// semántica OR: basta que un patrón haga match para NO transpilar), así que no
// se puede sobrescribir desde customJestConfig. Resolvemos la config de next/jest
// y REEMPLAZAMOS transformIgnorePatterns para permitir transpilar el árbol ESM de
// MSW (el transform SWC de next/jest cubre .mjs). El separador es cross-platform.
const ESM_DEPS = [
  'msw',
  '@mswjs',
  '@bundled-es-modules',
  '@open-draft',
  'rettime',
  'until-async',
  'strict-event-emitter',
  'outvariant',
  'headers-polyfill',
  'is-node-process',
  'graphql',
].join('|');

module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = [
    `[/\\\\]node_modules[/\\\\](?!(${ESM_DEPS})[/\\\\])`,
    '^.+\\.module\\.(css|sass|scss)$',
  ];
  return config;
};
