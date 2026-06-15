// ============================================================================
// Configuración de Jest para el frontend (Next.js + TypeScript)
// ----------------------------------------------------------------------------
// Usamos `next/jest`, que monta el compilador SWC de Next.js automáticamente:
// no hace falta ts-jest ni babel, y respeta next.config.js, paths y .env.
// Ver módulo "Setup Node.js Testing" de la masterclass.
// ============================================================================
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customJestConfig = {
  // La lógica que testeamos (lib/) es pura: no necesita DOM -> entorno node.
  testEnvironment: 'node',
  // Resolver el alias "@/..." igual que tsconfig.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Medir cobertura SOLO de la lógica de negocio/cliente unit-testeable (.ts).
  // Se excluyen los .tsx (auth-context, providers): son componentes React que
  // requieren entorno DOM + React Testing Library, fuera del alcance unit aquí.
  collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/*.d.ts'],
  // Gate de cobertura (fiel a la masterclass: mínimo 80% de líneas).
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
  // lcov -> lo consume Codecov; text -> resumen legible en los logs de CI.
  coverageReporters: ['text', 'lcov'],
  // No escanear artefactos de build (evita colisiones de haste-map).
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
};

module.exports = createJestConfig(customJestConfig);
