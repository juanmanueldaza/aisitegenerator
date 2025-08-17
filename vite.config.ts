import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Ensure these heavy libraries are in their own chunks
          mermaid: ['mermaid'],
          markdown: ['marked', 'marked-highlight', 'dompurify', 'prismjs'],
        },
      },
    },
  },
  server: {
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
