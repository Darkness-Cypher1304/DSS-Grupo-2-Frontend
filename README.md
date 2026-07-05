# NeuroAlert · Frontend

Interfaz web de **NeuroAlert**, plataforma para la **detección temprana de
señales del Trastorno del Espectro Autista (TEA)** en niños, que conecta a las
familias con especialistas médicos. Este repositorio es el **frontend**; la API
vive en el repositorio `DSS-Grupo-2` (backend NestJS).

> **Rama `main` = fuente de verdad.** La antigua rama `develop` quedó obsoleta y
> no se utiliza.

---

## Tecnologías

- **Next.js 15** (App Router, `output: standalone`) · **React 19** · TypeScript
- **Tailwind CSS** · **framer-motion** (transiciones) · **lucide-react** (iconos)
- **TanStack React Query** (estado de servidor) · **Axios** (cliente HTTP)
- **react-hook-form** + **Zod** (formularios y validación)
- **jspdf** (exportar el resultado del M-CHAT a PDF) · **react-markdown** (artículos)
- **Jest** + **React Testing Library** + **MSW** (tests unit e integración) · Docker · GitHub Actions · Render

---

## Estructura del proyecto

```
src/
  app/                     App Router, agrupado por rol:
    (auth)/                login, registro, verificación, reseteo, postulación
    (parent)/              dashboard, M-CHAT, consultas, recursos, cuenta
    (specialist)/          panel, consultas, contenido, cuenta
    (admin)/               usuarios, solicitudes, contenido, bajas
    about/ articles/ specialists/   páginas públicas
    layout.tsx / template.tsx       layout global y transiciones de ruta
  components/              UI reutilizable (loader, campana de notificaciones, etc.)
  lib/
    api-client.ts          cliente Axios (Bearer + refresh automático en 401)
    auth-context.tsx       contexto de autenticación (login/register/logout/refresh)
    providers.tsx          React Query + AuthProvider
    utils.ts               utilidades

tests/                     (hermana de src/ — ver sección «Testing»)
  unit/                    unidades aisladas (lib, components, contexts, providers)
  integration/             flujos con React Testing Library + MSW (API simulada)
  mocks/ fixtures/ helpers/ setup/   dobles, datos, utilidades y arranque de tests
  e2e/                     reservado para Playwright (fase futura)
```

---

## Autenticación (resumen)

- El **access token** (JWT) se guarda **solo en memoria** y viaja como
  `Authorization: Bearer`.
- El **refresh token** vive en una **cookie HttpOnly**; ante un `401`, el cliente
  hace *refresh* automático (deduplicado) y reintenta la petición.
- Las respuestas del backend vienen envueltas en `{ data: ... }`; los helpers
  `apiGet/apiPost/apiPatch/apiDelete` las desempaquetan.

---

## Puesta en marcha (local)

Requisitos: Node.js y el backend corriendo (por defecto en `http://localhost:4000`).

```bash
npm install                 # instalar dependencias
cp .env.example .env.local  # configurar NEXT_PUBLIC_API_URL (ver abajo)
npm run dev                 # servidor de desarrollo (http://localhost:3000)
```

### Variables de entorno

La única variable necesaria es **`NEXT_PUBLIC_API_URL`** (URL base del backend).
Ver [`.env.example`](./.env.example). Al empezar por `NEXT_PUBLIC_` queda embebida
en el bundle del navegador: **es pública, no debe contener secretos.**

---

## Scripts útiles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Compilar y ejecutar en producción |
| `npm run lint` · `npm run type-check` | Calidad de código |
| `npm test` | Toda la suite de tests (Jest) |
| `npm run test:unit` · `npm run test:integration` | Tests unit / integración por separado |
| `npm run test:coverage` | Cobertura combinada (aplica el **Coverage Gate 85%**) |
| `npm run audit` | Auditoría de dependencias (`npm audit`) |

---

## Testing

Arquitectura en `tests/` (hermana de `src/`), con separación **unit / integration**
según la pirámide de testing (F.I.R.S.T., AAA, tests de **comportamiento**):

- **Unit** (`tests/unit/`): lógica (`lib/`) y componentes en aislamiento.
- **Integration** (`tests/integration/`): flujos reales con **React Testing Library**
  y **MSW** (la API se simula, sin red).
- **E2E** (`tests/e2e/`): **reservado** para Playwright (fase futura, aún no implementado).

**Coverage Gate: mínimo 85%** en *statements/branches/functions/lines* sobre la
cobertura **combinada** (lo aplica Jest vía `coverageThreshold`; **rompe el CI** si no
se cumple). El pipeline publica un **reporte de cobertura multivista** en el resumen de
GitHub Actions (global, por tipo de test, cobertura de código nuevo, focos de atención,
distribución y detalle por archivo).

```bash
npm run test:unit          # solo unit
npm run test:integration   # solo integración (RTL + MSW)
npm run test:coverage      # suite combinada + Coverage Gate 85%
```

---

## CI/CD (`.github/workflows/ci-cd.yml`)

En cada `push`/`pull_request` a `main` (los jobs de deploy corren solo en `push`):

1. **quality** — `type-check` + `lint`.
2. **unit-tests** ∥ **integration-tests** — jobs **separados y en paralelo**; cada uno
   publica su resumen (suites/tests/duración) en el *job summary*.
3. **coverage-gate** — suite combinada + **Coverage Gate 85%** (falla el CI si no se
   cumple) + reporte de cobertura multivista.
4. **codeql** (SAST) ∥ **supply-chain** (Trivy + SBOM) — en paralelo.
5. **dependency-scan** — `npm audit`.
6. **build** (Node 24, con `NEXT_PUBLIC_API_URL`).
7. **deploy-dev → smoke-test → dast (OWASP ZAP) → security-gate → deploy-prod**:
   despliegue a Render con escaneo dinámico y gate de seguridad.
   *(Hay un job de **E2E reservado** entre smoke-test y dast, aún inactivo.)*

### Despliegue (Render)

- **Desarrollo:** `https://neuroalert-frontend-dev.onrender.com`
- **Producción:** `https://neuroalert-frontend-prod.onrender.com`

Ambos ambientes se despliegan desde `main` mediante *deploy hooks*.

---

## Flujo de trabajo (ramas)

La rama `main` está **protegida**. No se hace commit ni push directo a `main`.

1. Partir de `main` actualizada (`git pull`).
2. Crear una rama con nombre descriptivo (`feat/…`, `fix/…`, `chore/…`, `docs/…`).
3. Hacer los cambios y validarlos (`type-check`, `lint`, `test`).
4. `push` de la rama y abrir un **Pull Request** hacia `main`.
5. La revisión y el *merge* los realiza otra persona (no se aprueba el propio PR).

Al mergear, la rama se elimina para mantener el repositorio limpio.
