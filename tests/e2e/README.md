# tests/e2e — Reservado para pruebas End-to-End (Playwright)

Esta carpeta está **reservada** para la próxima capa de la pirámide de testing:
pruebas **E2E con Playwright** contra el entorno **DEV desplegado** en Render.

> **No implementado todavía.** Se deja preparado a nivel de arquitectura para
> incorporarlo sin reestructurar el proyecto ni el resto de la suite.

## Por qué está separado de `tests/integration`

- `tests/integration` valida la integración **en proceso** (React Testing Library
  + MSW con la API simulada), sin red real. Corre en cada PR, es rápido y
  determinista, y forma parte del **Coverage Gate**.
- `tests/e2e` (futuro) validará la aplicación **real desplegada** (navegador
  real, backend real de DEV). No mide cobertura de unidades: valida flujos de
  usuario extremo a extremo.

## Cómo se incorporará (checklist futuro)

1. `npm i -D @playwright/test` y `npx playwright install --with-deps chromium`.
2. Crear `playwright.config.ts` en la raíz (`testDir: './tests/e2e'`,
   `baseURL` = URL de DEV vía variable/secret).
3. Añadir el script `"test:e2e": "playwright test"` en `package.json`.
4. Escribir los specs `*.spec.ts` aquí (p. ej. `auth.spec.ts`, `mchat.spec.ts`).
5. Activar el job **`e2e`** ya reservado en `.github/workflows/ci-cd.yml`:
   quitar `if: false`, añadir los pasos de Playwright y encadenar el job `dast`
   con `needs: [e2e]` para que corra **después** de los E2E (tras el smoke-test).

El job ya está declarado como *placeholder* (`if: false`) entre `smoke-test` y
`dast`, de modo que la topología del pipeline no cambia al activarlo.
