# Deployment Guidelines for AI Site Generator

This document outlines deployment strategies, CI/CD practices, and infrastructure management for the AI Site Generator project.

## 🎯 Deployment Philosophy

We follow a **continuous deployment approach** emphasizing:

- **Automated deployments**: Minimal manual intervention required
- **Environment parity**: Development, staging, and production consistency
- **Zero-downtime deploys**: Users never experience service interruption
- **Rollback capability**: Quick recovery from deployment issues
- **Security first**: All deployments follow security best practices

## 🏗️ Infrastructure Overview

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend App  │───▶│   GitHub Pages  │───▶│  User's Browser │
│   (React SPA)   │    │   (Static Host) │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                                │
         ▼                                                │
┌─────────────────┐                                       │
│   Proxy Server  │◀──────────────────────────────────────┘
│   (CORS Helper) │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  External APIs  │
│ (GitHub, Gemini)│
└─────────────────┘
```

### Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Hosting**: GitHub Pages (static hosting)
- **CI/CD**: GitHub Actions
- **Package Manager**: npm
- **Build Tool**: Vite
- **Testing**: Vitest + Playwright

## 🚀 Deployment Strategies

### 1. GitHub Pages Deployment

**Primary deployment method for the main application:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run quality gates
        run: |
          npm run typecheck
          npm run lint
          npm run test:unit

      - name: Build for production
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.sha }}
          VITE_BUILD_DATE: ${{ github.event.head_commit.timestamp }}

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
```

### 2. Preview Deployments

**For pull requests and feature branches:**

```yaml
# .github/workflows/preview-deploy.yml
name: Preview Deployment

on:
  pull_request:
    branches: [main]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for preview
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.event.pull_request.head.sha }}
          VITE_PREVIEW_MODE: true

      - name: Deploy to Netlify (Preview)
        uses: nwtgck/actions-netlify@v2.1
        with:
          publish-dir: './dist'
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: 'Preview for PR #${{ github.event.number }}'
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 3. Development Environment

**Local development setup:**

```bash
# Development server with hot reload
npm run dev

# Preview production build locally
npm run build
npm run preview

# Development with proxy for API calls
npm run dev:with-proxy
```

## 🔧 Build Configuration

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true,
        // JSX runtime
        jsxRuntime: 'automatic',
      }),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@services': resolve(__dirname, 'src/services'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@types': resolve(__dirname, 'src/types'),
      },
    },

    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            // Ensure these heavy libraries are in their own chunks
            mermaid: ['mermaid'],
            markdown: ['marked', 'marked-highlight', 'dompurify', 'prismjs'],
            // Group test-only artifacts to avoid impacting main bundle
            testing: ['@testing-library/react', '@testing-library/user-event'],
          },
        },
      },
    },

    server: {
      port: 3000,
      open: true,

      // Proxy API requests during development
      proxy: {
        '/api': {
          target: env.VITE_PROXY_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: 3001,
      open: true,
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION || 'dev'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
  };
});
```

### Environment Configuration

```typescript
// src/constants/config.ts
interface Config {
  readonly APP_VERSION: string;
  readonly BUILD_DATE: string;
  readonly API_BASE_URL: string;
  readonly GITHUB_CLIENT_ID: string;
  readonly GEMINI_API_PROXY: string;
  readonly ENVIRONMENT: 'development' | 'staging' | 'production';
  readonly FEATURES: {
    readonly ANALYTICS: boolean;
    readonly DEBUG_MODE: boolean;
    readonly PREVIEW_MODE: boolean;
  };
}

const config: Config = {
  APP_VERSION: import.meta.env.VITE_APP_VERSION || 'dev',
  BUILD_DATE: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.github.com',
  GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  GEMINI_API_PROXY: import.meta.env.VITE_GEMINI_PROXY || '/api/ai',
  ENVIRONMENT: (import.meta.env.MODE as Config['ENVIRONMENT']) || 'development',

  FEATURES: {
    ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    DEBUG_MODE: import.meta.env.MODE === 'development',
    PREVIEW_MODE: import.meta.env.VITE_PREVIEW_MODE === 'true',
  },
} as const;

export default config;
```

### Environment Variables

```bash
# .env.local (local development)
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_PROXY_URL=http://localhost:8000
VITE_DEBUG_MODE=true

# .env.staging (staging environment)
VITE_GITHUB_CLIENT_ID=staging_github_client_id
VITE_API_BASE_URL=https://api.github.com
VITE_GEMINI_PROXY=https://your-proxy.vercel.app/api/ai
VITE_ENABLE_ANALYTICS=false

# .env.production (production environment)
VITE_GITHUB_CLIENT_ID=production_github_client_id
VITE_API_BASE_URL=https://api.github.com
VITE_GEMINI_PROXY=https://your-proxy.vercel.app/api/ai
VITE_ENABLE_ANALYTICS=true
```

## 🔄 CI/CD Pipeline

### Complete Workflow

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  # Quality Gates
  quality-check:
    name: Quality Gates
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type checking
        run: npm run typecheck

      - name: Linting
        run: npm run lint

      - name: Unit tests with coverage
        run: npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  # Security Scanning
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # Build and Test
  build-and-test:
    name: Build and Integration Tests
    runs-on: ubuntu-latest
    needs: [quality-check, security-scan]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.sha }}

      - name: Integration tests
        run: npm run test:integration
        env:
          TEST_GITHUB_TOKEN: ${{ secrets.TEST_GITHUB_TOKEN }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  # E2E Tests
  e2e-tests:
    name: End-to-End Tests
    runs-on: ubuntu-latest
    needs: build-and-test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Start preview server
        run: |
          npm run preview &
          sleep 10

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # Deploy to Staging (on develop branch)
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build-and-test, e2e-tests]
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'

    environment:
      name: staging
      url: https://staging-aisitegen.netlify.app

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for staging
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.sha }}
          VITE_ENVIRONMENT: staging
          VITE_GITHUB_CLIENT_ID: ${{ secrets.STAGING_GITHUB_CLIENT_ID }}

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.1
        with:
          publish-dir: './dist'
          production-deploy: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: 'Staging deployment ${{ github.sha }}'
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.STAGING_NETLIFY_SITE_ID }}

  # Deploy to Production (on main branch)
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build-and-test, e2e-tests]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    environment:
      name: production
      url: https://aisitegenerator.github.io

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.sha }}
          VITE_ENVIRONMENT: production
          VITE_GITHUB_CLIENT_ID: ${{ secrets.PRODUCTION_GITHUB_CLIENT_ID }}

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload to GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3

      - name: Create release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          body: |
            Automated release from commit ${{ github.sha }}

            Deployment URL: ${{ steps.deployment.outputs.page_url }}
          draft: false
          prerelease: false
```

## 🚨 Rollback Strategies

### Automated Rollback

```yaml
# .github/workflows/rollback.yml
name: Emergency Rollback

on:
  workflow_dispatch:
    inputs:
      target_commit:
        description: 'Commit SHA to rollback to'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout target commit
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.target_commit }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.event.inputs.target_commit }}
          VITE_ENVIRONMENT: production

      - name: Deploy rollback
        uses: actions/deploy-pages@v3
        with:
          path: ./dist

      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "🚨 Emergency rollback deployed",
              attachments: [{
                color: "warning",
                fields: [{
                  title: "Rollback Target",
                  value: "${{ github.event.inputs.target_commit }}",
                  short: true
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Manual Rollback Process

1. **Identify the issue**: Determine if a rollback is necessary
2. **Find target commit**: Locate the last known good deployment
3. **Execute rollback**: Run the rollback workflow or manual process
4. **Verify rollback**: Test that the issue is resolved
5. **Communicate**: Notify stakeholders about the rollback
6. **Post-mortem**: Analyze the issue and improve processes

## 🔒 Security Considerations

### Secrets Management

```yaml
# Required GitHub Secrets
secrets:
  # GitHub Pages deployment
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Auto-provided

  # External services
  STAGING_GITHUB_CLIENT_ID: ${{ secrets.STAGING_GITHUB_CLIENT_ID }}
  PRODUCTION_GITHUB_CLIENT_ID: ${{ secrets.PRODUCTION_GITHUB_CLIENT_ID }}

  # Preview deployments
  NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
  NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  # Testing
  TEST_GITHUB_TOKEN: ${{ secrets.TEST_GITHUB_TOKEN }}

  # Monitoring
  CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Build Security

```typescript
// Security headers for production builds
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Ensure no sensitive data in bundle
        banner: '/* AI Site Generator - Public Build */',

        // Minify for production
        compact: true,
      },
    },
  },

  define: {
    // Only expose necessary environment variables
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION),
    __ENVIRONMENT__: JSON.stringify(process.env.NODE_ENV),
  },
});
```

### Content Security Policy

```html
<!-- dist/index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.github.com https://gemini-api.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
"
/>
```

## 📊 Monitoring and Observability

### Deployment Monitoring

```typescript
// src/utils/monitoring.ts
interface DeploymentInfo {
  version: string;
  buildDate: string;
  environment: string;
  commit: string;
}

export const reportDeploymentHealth = async (info: DeploymentInfo) => {
  try {
    // Report to monitoring service
    await fetch('/api/health-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...info,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });
  } catch (error) {
    console.warn('Failed to report deployment health:', error);
  }
};

// Initialize on app start
reportDeploymentHealth({
  version: __APP_VERSION__,
  buildDate: __BUILD_DATE__,
  environment: import.meta.env.MODE,
  commit: __APP_VERSION__.slice(0, 8),
});
```

### Error Tracking

```typescript
// src/utils/errorTracking.ts
interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
  version: string;
}

export const trackError = (error: Error, context?: any) => {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    version: __APP_VERSION__,
  };

  // Log to console in development
  if (import.meta.env.MODE === 'development') {
    console.error('Error tracked:', report, context);
  }

  // Send to error tracking service in production
  if (import.meta.env.MODE === 'production') {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...report, context }),
    }).catch(() => {
      // Fail silently to avoid recursive errors
    });
  }
};
```

## 🎯 Performance Optimization

### Build Optimization

```javascript
// Build analysis script
// scripts/analyze-bundle.js
import { analyzeMetafile } from 'esbuild';
import { readFileSync } from 'fs';

const metafile = JSON.parse(readFileSync('dist/metafile.json', 'utf8'));
const analysis = await analyzeMetafile(metafile);

console.log('Bundle Analysis:');
console.log(analysis);

// Check for large chunks
const outputs = Object.entries(metafile.outputs);
const largeChunks = outputs.filter(([_, info]) => info.bytes > 500000);

if (largeChunks.length > 0) {
  console.warn('⚠️ Large chunks detected:');
  largeChunks.forEach(([file, info]) => {
    console.warn(`${file}: ${(info.bytes / 1024).toFixed(2)} KB`);
  });

  process.exit(1);
}
```

### Deployment Caching

```yaml
# Cache optimization in GitHub Actions
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Cache build output
  uses: actions/cache@v3
  with:
    path: dist
    key: build-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      build-${{ runner.os }}-
```

## 📝 Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan completed
- [ ] Performance budget verified
- [ ] Environment variables configured
- [ ] Database migrations (if applicable)
- [ ] Feature flags configured

### During deployment

- [ ] Monitor build process
- [ ] Verify no build errors
- [ ] Check deployment status
- [ ] Monitor error rates
- [ ] Verify health checks

### Post-deployment

- [ ] Smoke tests completed
- [ ] Performance metrics normal
- [ ] Error rates within acceptable range
- [ ] User feedback monitoring
- [ ] Rollback plan ready if needed

Remember: **Successful deployments are the result of good preparation, automation, and monitoring.**

Focus on creating reliable, repeatable processes that minimize risk and maximize confidence in your releases.
