import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  // Support GitHub Pages repo subpaths by allowing a base from env in CI
  // Locally this remains '/'
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    hmr: {
      host: 'localhost',
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/events': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
      }
    }
  }
})
