// ============================================================================
// ESLint SECURITY (flat config) — SAST de patrones inseguros con
// eslint-plugin-security. SEPARADA de la config de calidad (`next lint` sobre
// `.eslintrc.json`) a propósito: distinta responsabilidad (seguridad, no
// estilo/calidad), por lo que se ejecuta en el job de seguridad del pipeline,
// no en Code Quality & Build. Se invoca explícitamente con
// `eslint -c eslint.security.config.js` → NO interfiere con `next lint`.
// ----------------------------------------------------------------------------
// Paridad con el backend (misma versión eslint-plugin-security@^4). Recomendación
// del curso: iniciar el SAST con eslint-plugin-security (feedback inmediato) y
// complementarlo con CodeQL (análisis semántico). Ambos COEXISTEN en jobs
// distintos del pipeline; no compiten ni se pisan.
//
// Este gate es BLOQUEANTE: se ejecuta con `--max-warnings 0`, de modo que
// cualquier hallazgo de una regla activa detiene el pipeline.
// ============================================================================

const security = require('eslint-plugin-security');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'tests/**',
      'out/**',
      'next.config.js',
    ],
  },
  // Reglas recomendadas del plugin (activan todas las security/detect-*).
  security.configs.recommended,
  {
    // Solo el código de producción (src). Incluye .tsx (componentes React).
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      // Parser TS SIN `project`: las reglas de seguridad trabajan sobre el AST y
      // no requieren información de tipos → más rápido. Se habilita JSX para .tsx.
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // ----------------------------------------------------------------------
      // detect-object-injection → DESACTIVADA (a nivel de proyecto).
      // Motivo: es la regla con mayor tasa de FALSOS POSITIVOS del plugin;
      // dispara en TODO acceso por corchetes con variable (`obj[key]`), aun
      // cuando la clave es de tipo `keyof T` (acceso type-safe) o un índice
      // numérico de iteración. En un frontend Next/React estos accesos son
      // habituales y type-safe. La protección REAL contra inyección de
      // propiedades la dan: (a) el sistema de tipos de TypeScript, (b) la
      // validación con Zod en los formularios y (c) el análisis semántico de
      // CodeQL. Mantenerla bloqueante rompería el pipeline por ruido, sin
      // ganancia de seguridad. Misma decisión (con sustento) que en el backend.
      // ⏳ A FUTURO: reevaluar si conviene reactivarla con overrides puntuales.
      'security/detect-object-injection': 'off',
    },
  },
  {
    // ----------------------------------------------------------------------
    // detect-unsafe-regex → ACTIVA en todo `src/` (detecta ReDoS real), con
    // excepción SCOPEADA a este archivo: el regex de `linkedinUrl`
    // (`^https?:\/\/([\w-]+\.)+[\w-]+(\/\S*)?$`) lo marca la heurística por el
    // cuantificador anidado, pero se MIDIÓ empíricamente y es SEGURO: con
    // entradas maliciosas de hasta 20.000 caracteres corre en < 0,8 ms y de
    // forma LINEAL (el `.` obligatorio entre repeticiones impide el backtracking
    // catastrófico). Es el MISMO regex ya medido en el backend (applications.dto.ts).
    // ⏳ A FUTURO: si el regex cambia, reevaluar esta excepción.
    files: ['**/postular/formulario/page.tsx'],
    rules: {
      'security/detect-unsafe-regex': 'off',
    },
  },
  {
    // ----------------------------------------------------------------------
    // detect-possible-timing-attacks → ACTIVA en todo `src/`, con excepción
    // SCOPEADA a este archivo: la comparación `password !== confirm` es una
    // validación de FORMULARIO en el CLIENTE (el navegador compara la contraseña
    // con su confirmación, ambas tecleadas por el propio usuario). NO hay
    // superficie de timing attack: no se compara ningún secreto contra una
    // entrada del atacante por un canal observable en tiempo. La regla, pensada
    // para comparaciones de secretos en SERVIDOR, es un falso positivo aquí.
    files: ['**/reset-password/page.tsx'],
    rules: {
      'security/detect-possible-timing-attacks': 'off',
    },
  },
];
