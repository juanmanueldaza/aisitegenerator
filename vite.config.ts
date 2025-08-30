import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
    // Respect a custom port (e.g., when running behind a proxy or task runner)
    port: Number(process.env.PORT) || undefined,
    host: process.env.HOST || undefined,
    hmr: {
      // Ensure the client connects back to the same port/host when served via a proxy (e.g., localhost:4000)
      clientPort: Number(process.env.PORT) || undefined,
      host: process.env.HOST || undefined,
      protocol: (process.env.HMR_PROTOCOL as 'ws' | 'wss') || 'ws',
    },
    proxy: {
      // Dev-only proxy to bypass browser CORS when calling GitHub OAuth endpoints
      '/__gh/oauth': {
        target: 'https://github.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'User-Agent': 'aisitegenerator-dev-proxy',
          Accept: 'application/json',
        },
        rewrite: (p) => p.replace(/^\/__gh\/oauth/, '/login/oauth'),
      },
      '/__gh/device': {
        target: 'https://github.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'User-Agent': 'aisitegenerator-dev-proxy',
          Accept: 'application/json',
        },
        rewrite: (p) => p.replace(/^\/__gh\/device/, '/login/device'),
      },
      // Local AI proxy pass-through (if you run `npm run proxy`)
      '/api/ai': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Vercel AI SDK router pass-through
      '/api/ai-sdk': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
});
