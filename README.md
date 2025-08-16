# AI Site Generator

Aplicación moderna (frontend) para crear sitios paso a paso asistidos por IA, con vista previa en vivo, soporte de Markdown y diagramas Mermaid. Autenticación con GitHub y despliegue vía GitHub Pages.

## 🚀 Tech Stack

- Frontend: React 19 + TypeScript
- Build: Vite 7
- Calidad: ESLint + Prettier + Husky + Vitest
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
└── styles/         # Estilos globales
```

### Principios de arquitectura

- SOLID y CLEAN: separación de responsabilidades y límites claros
- DRY y KISS: reutiliza utilidades y manténlo simple

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

## 📜 Scripts disponibles

- `npm run dev` — Dev server (HMR)
- `npm run build` — Build producción
- `npm run preview` — Previsualización del build
- `npm run lint` / `lint:fix` — Lint
- `npm run format` / `format:check` — Formato
- `npm run typecheck` — Tipado TS
- `npm run test` / `test:watch` — Tests con Vitest

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

## 🎯 Roadmap

- [ ] GitHub OAuth integration
- [ ] AI chat interface implementation
- [ ] Site template system
- [ ] GitHub Pages deployment automation
- [ ] Site management dashboard

## 🤝 Contribuir

1. Crea rama feature
2. Implementa siguiendo guías
3. `npm run lint && npm run typecheck && npm run test && npm run build`
4. PR con Conventional Commits

## 📄 Licencia

MIT

---

Built with ❤️ using modern web technologies and clean architecture principles.
