# Architecture Guidelines for AI Site Generator

## 🏗️ **System Architecture**

AI Site Generator follows a **frontend-only, client-side architecture** optimized for simplicity, security, and performance.

### **Core Architectural Principles**

1. **Zero Backend Dependency**
   - All functionality runs in the browser
   - No server-side processing required
   - Direct integration with external APIs (GitHub, Gemini AI)

2. **Component-Based Structure**

   ```
   src/
   ├── components/        # Reusable UI components (DaisyUI-based)
   ├── services/         # API integrations & business logic
   ├── hooks/            # Custom React hooks
   ├── store/            # State management (Zustand)
   ├── types/            # TypeScript definitions
   └── utils/            # Helper functions
   ```

3. **Layered Responsibility**
   - **UI Layer**: React components with DaisyUI styling
   - **Service Layer**: API integrations (GitHub, Gemini AI)
   - **State Layer**: Centralized state management with Zustand
   - **Utility Layer**: Shared helper functions

### **Key Architectural Decisions**

1. **React 19 + TypeScript**: Type safety and component reusability
2. **Vite 7**: Fast development and optimized builds
3. **Tailwind CSS v4.1.12 + DaisyUI v4.12.10**: Utility-first CSS with component library
4. **Direct API Integration**: No middleware or backend proxies
5. **Client-Side Authentication**: OAuth flows handled in browser
6. **Static Deployment**: Works on any static hosting platform

### **Data Flow Patterns**

```
User Input → Component → Hook → Service → External API
     ↓
State Store ← Response Processing ← API Response
     ↓
UI Update ← Component Re-render ← State Change
```

### **Security Architecture**

- **Content Security Policy**: Strict CSP headers
- **Input Sanitization**: All user inputs sanitized
- **API Token Security**: Secure token storage and transmission
- **XSS Prevention**: No direct innerHTML usage

### **Performance Architecture**

- **Bundle Optimization**: Tree shaking and code splitting
- **Lazy Loading**: Components loaded on demand
- **Caching Strategy**: Smart caching of API responses
- **Memory Management**: Cleanup of event listeners and resources
- **Current Bundle Size**: 18.86 kB CSS (4.71 kB gzipped)

## 🎯 **Component Architecture Guidelines**

### **Component Structure**

```typescript
// Component file organization
ComponentName/
├── index.ts          # Export barrel
├── ComponentName.tsx # Main component (DaisyUI classes)
├── ComponentName.css # Additional custom styles (minimal)
└── ComponentName.types.ts # Type definitions
```

### **Component Responsibilities**

- **Presentational**: UI rendering with DaisyUI components
- **Container**: State management and business logic
- **Hook-based**: Reusable stateful logic

### **State Management Pattern**

- **Zustand Store**: Centralized state management with persistence
- **Local State**: Component-specific UI state with useState
- **Custom Hooks**: Shared stateful logic and API integration

## 🔧 **Development Architecture**

### **Build Pipeline**

```
Source Code → TypeScript Check → Linting → Testing → Bundle → Deploy
```

### **Testing Strategy**

- Unit tests for utilities and services
- Component testing for UI elements
- E2E testing for critical user flows

### **Code Organization**

- Feature-based folder structure
- Clear separation of concerns
- Consistent naming conventions
- Type-first development approach

## 📦 **Deployment Architecture**

### **Static Site Hosting**

- GitHub Pages (primary)
- Vercel/Netlify (alternatives)
- CDN distribution for global performance

### **Build Optimization**

- Minification and compression
- Asset optimization
- Bundle size monitoring
- Performance budgets

This architecture ensures AI Site Generator remains lightweight, secure, and maintainable while providing powerful site generation capabilities.

## 🎨 **UI Framework Status**

### **DaisyUI Migration: ✅ COMPLETE**

- **Migration Status**: All 5 phases completed successfully
- **Components Migrated**: All UI components now use DaisyUI classes
- **Themes Available**: 35+ built-in themes + custom "aisite" theme
- **Theme System**: Dynamic theme switching with ThemeProvider and ThemeController
- **Build Impact**: Optimized bundle size (18.86 kB CSS, 4.71 kB gzipped)
- **GitHub Issues**: All related issues closed and changes committed
