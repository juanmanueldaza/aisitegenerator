# AI Site Generator

Aplicación moderna (frontend) para crear sitios paso a paso asistidos por IA, con vista previa en vivo, soporte de Markdown y diagramas Mermaid. Autenticación con GitHub y despliegue vía GitHub Pages.

## 🚀 Tech Stack

- Frontend: React 19 + TypeScript
- Build: Vite 7
- Testing: Vitest + React Testing Library + Playwright
- Calidad: ESLint + Prettier + Husky
- CI/CD: GitHub Actions con quality gates automatizados
- Arquitectura: Clean Architecture (SOLID)

## 📁 Estructura del proyecto

```
src/
├── components/     # Componentes de UI
├── hooks/          # Hooks personalizados
├── services/       # Integraciones externas y lógica de negocio
├── types/          # Tipos compartidos
├── utils/          # Utilidades puras
├── assets/         # Recursos estáticos
├── test-utils.ts   # Utilidades de testing
└── setupTests.ts   # Configuración global de tests

tests/
├── e2e/           # Tests End-to-End con Playwright
└── fixtures/      # Datos de prueba

scripts/
└── quality-gates.sh # Script de validaciones de calidad

docs/
└── TESTING.md     # Documentación completa de testing
```

### Principios de arquitectura

- SOLID y CLEAN: separación de responsabilidades y límites claros
- DRY y KISS: reutiliza utilidades y manténlo simple
- Testing Pyramid: 70% unit, 20% integration, 10% E2E
- Quality Gates: validaciones automatizadas en CI/CD

## 🛠️ Entorno de desarrollo

### Prerrequisitos

- Node.js 18+
- npm
- Git

### Instalación

1. Clona el repo
2. Instala dependencias con `npm install`
3. Inicia con `npm run dev`
4. Abre `http://localhost:5173`

### Configuración de IA (Proxies y proveedores)

Variables de entorno (Vite):

- `VITE_AI_SDK_PROXY_BASE_URL`: p.ej. `/api/ai-sdk` (router con Vercel AI SDK)
- `VITE_AI_PROXY_BASE_URL`: p.ej. `/api/ai` (proxy legado, opcional)
- `VITE_AI_USE_LEGACY_PROXY`: `'true'` para forzar el proxy legado si ambos existen (por defecto `false`)
- `VITE_AI_DEFAULT_PROVIDER`: `google | openai | anthropic | cohere` (por defecto `google`)
- `VITE_AI_DEFAULT_MODEL`: nombre de modelo específico del proveedor (por defecto `gemini-2.0-flash`)

Comportamiento:

- Si `VITE_AI_SDK_PROXY_BASE_URL` está definido y `VITE_AI_USE_LEGACY_PROXY` no es `'true'`, la app usará el proxy AI SDK (claves gestionadas en el servidor, multproveedor).
- Si `VITE_AI_USE_LEGACY_PROXY='true'` y `VITE_AI_PROXY_BASE_URL` está definido, la app usará el proxy legado.
- Si no hay proxy configurado, el cliente usará el SDK de Gemini directamente y requerirá una clave local (campo en la UI).

El endpoint `GET /api/ai-sdk/providers` indica qué proveedores están habilitados en el servidor (módulo instalado y clave presente) y la UI deshabilita las opciones sin clave.

## 📜 Scripts disponibles

### Desarrollo

- `npm run dev` — Dev server (HMR)
- `npm run build` — Build producción
- `npm run preview` — Previsualización del build

### Calidad de código

- `npm run lint` / `lint:fix` — ESLint
- `npm run format` / `format:check` — Prettier
- `npm run typecheck` — Tipado TypeScript

### Testing (Siguiendo la pirámide de testing)

- `npm run test` — Tests básicos
- `npm run test:coverage` — Tests con reporte de cobertura (80% mínimo)
- `npm run test:watch` — Modo watch para desarrollo
- `npm run test:ui` — Interfaz visual de testing
- `npm run test:unit` — Solo tests unitarios
- `npm run test:integration` — Solo tests de integración

### Quality Gates

- `./scripts/quality-gates.sh` — Ejecuta todas las validaciones de calidad
- `npm run quality-gates` — Versión integrada en VS Code tasks

## 🏗️ Arquitectura

### Capa de servicios

- Interfaces para Auth (GitHub), GitHub (repos/Pages), Sites, IA

### Capa de componentes

- Presentación pura, orientada a props y testeable

### Hooks

- Lógica reutilizable (e.g., `useLocalStorage`)

### Utilidades

- Sanitización de HTML y render de Markdown/Mermaid asíncrono y seguro

## ✨ Funcionalidades

- Vista previa de Markdown en vivo con sanitización
- Mermaid asíncrono a SVG sanitizado
- Manejo de errores y degradación
- Diseño responsivo
- Listo para GitHub Pages
- **Testing infrastructure completa** con cobertura del 80%
- **Quality gates automatizados** en CI/CD
- **Cross-browser testing** con Playwright

## 🔐 Autenticación con GitHub (PKCE + Device Flow)

Esta app soporta dos flujos de autenticación:

- PKCE (recomendado en producción)
  - Registra un GitHub OAuth App con redirect URI exacta en tu dominio (por ejemplo, `https://aisitegenerator.daza.ar/oauth/callback`).
  - El Client ID se puede ingresar en tiempo de ejecución desde la UI o via query string `?gh_client_id=...`.
  - Puedes sobreescribir el redirect con `?gh_redirect=...` si necesitas probar otros entornos.
- Device Authorization Flow (ideal para desarrollo local)
  - No requiere callback ni variables en build. La UI muestra el código de usuario y la URL para autorizar.

Depuración útil:

- Agrega `?auth_debug=1` a la URL para ver logs de autenticación detallados (valores sensibles se enmascaran).

Notas técnicas:

- Los estados/tokens temporales se almacenan en `sessionStorage`.
- En desarrollo, existe un proxy dev para endpoints de OAuth cuando es necesario.

### Seguridad y CSP

Lee SECURITY.md para recomendaciones de almacenamiento de tokens, pautas de Content Security Policy y cómo revocar permisos.

## 🚀 Despliegue a GitHub Pages

- El flujo de subida a Contents API incluye `sha` al actualizar archivos para evitar errores de conflicto.
- Asegúrate de tener GitHub Pages habilitado para la rama principal.

## 📚 Documentación completa

Consulta el índice de documentación en `.github/docs/`:

- Arquitectura, desarrollo, checklist de producción, investigación de OAuth y más: `.github/docs/README.md`

## 🤖 Copilot chat modes

Presets y guía en `.github/copilot-chat/README.md`.

- "GitHubDocsRefactorExpert": auditar `.github` y refactorizar documentación.
- "GitHubCopilotArchitect": estandarizar CI/plantillas y validar quality gates.
- "CodeFixerEnhancer": encontrar issues y proponer refactors con verificación.

## 🎯 Roadmap

- [ ] GitHub OAuth integration
- [ ] AI chat interface implementation
- [ ] Site template system
- [ ] GitHub Pages deployment automation
- [ ] Site management dashboard

## 🤝 Contribuir

1. Crea rama feature
2. Implementa siguiendo guías de arquitectura
3. **Ejecuta quality gates**: `./scripts/quality-gates.sh`
   - TypeScript type checking
   - ESLint code quality
   - Tests con cobertura mínima del 80%
   - Build de producción
   - Security audit
4. PR con Conventional Commits

### Testing Requirements

- **Unit tests**: Para componentes y utilidades individuales
- **Integration tests**: Para servicios e interacciones entre componentes
- **E2E tests**: Para flujos críticos de usuario
- **Coverage mínima**: 80% en statements, branches, functions y lines

Ver documentación completa en [`docs/TESTING.md`](docs/TESTING.md)

## 📄 Licencia

MIT

---

Built with ❤️ using modern web technologies and clean architecture principles.
