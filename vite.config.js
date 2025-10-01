import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Use a function form to access mode/env, ensuring VITE_* vars are loaded consistently
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_BASE = env.VITE_API_BASE || 'http://localhost:4000'
  const BASE_PATH = env.VITE_BASE_PATH || '/'

  return {
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom']
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    // Support GitHub Pages repo subpaths by allowing a base from env in CI
    // Locally this remains '/'
    base: BASE_PATH,
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
          target: API_BASE,
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: API_BASE,
          changeOrigin: true,
          secure: false,
        },
        '/events': {
          target: API_BASE,
          changeOrigin: true,
          ws: true,
        }
      }
    }
  }
})
