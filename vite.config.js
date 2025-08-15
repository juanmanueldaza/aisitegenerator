import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Enable tree shaking and code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate chunk for Mermaid to enable lazy loading
          'mermaid': ['mermaid']
        }
      }
    },
    // Enable source maps for debugging
    sourcemap: true,
    // Target modern browsers for smaller bundles
    target: 'es2020'
  },
  // Enable legacy browser support if needed
  plugins: [],
  // Optimize dependencies
  optimizeDeps: {
    include: ['mermaid']
  },
  server: {
    port: 3000,
    open: true
  }
});