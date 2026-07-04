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
- **Jest** (pruebas) · Docker · GitHub Actions · Render

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
| `npm test` · `npm run test:coverage` | Pruebas (Jest) y cobertura |
| `npm run audit` | Auditoría de dependencias (`npm audit`) |

---

## CI/CD (`.github/workflows/ci-cd.yml`)

En cada `push`/`pull_request` a `main`:

1. **build-and-test** — `type-check`, `lint`, tests (Jest) con cobertura y `build` (Node 24).
2. **codeql** — análisis estático de seguridad (SAST), en paralelo.
3. **supply-chain** — **Trivy** (vulnerabilidades) + **SBOM** CycloneDX, en paralelo.
4. **security-scan** — `npm audit`.
5. **deploy-dev → smoke-test → dast (OWASP ZAP) → security-gate → deploy-prod**
   (solo en `push`): despliegue a Render con escaneo dinámico y gate de seguridad.

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
