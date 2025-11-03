import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Use a function form to access mode/env, ensuring VITE_* vars are loaded consistently
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_BASE = env.VITE_API_BASE || 'http://localhost:4000'
  const BASE_PATH = env.VITE_BASE_PATH || '/'
  // Allow overriding dev server port via env; default to 5180 to align with local preference
  const DEV_PORT = Number(env.PORT || env.VITE_PORT || 5180)

  return {
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom']
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    // build settings
  // Support GitHub Pages repo subpaths by allowing a base from env in CI
  // Locally this remains '/'. For production builds served from a subpath
  // we preserve BASE_PATH. When BASE_PATH is the root '/', emit relative
  // asset links (./assets/...) so the site still works when hosted from
  // a non-root location (GitHub Pages or other static hosts that serve
  // index.html from a subdirectory). This avoids hard-coded absolute '/'
  // paths that break when the site is not at the domain root.
  base: (mode === 'production' && BASE_PATH === '/') ? './' : BASE_PATH,
    server: {
      port: DEV_PORT,
      // Relax strictPort so Vite can choose the next free port if needed
      strictPort: false,
      // Expose server on LAN for mobile testing
      host: true,
      open: true,
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
