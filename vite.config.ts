import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Required for GitHub OAuth in production
    'process.env': process.env
  }
})