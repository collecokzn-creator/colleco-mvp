import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// Use a function form to access mode/env, ensuring VITE_* vars are loaded consistently
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_BASE = env.VITE_API_BASE || 'http://localhost:4000'
  const BASE_PATH = env.VITE_BASE_PATH || '/'
  // Allow overriding dev server port via env; default to 5180 to align with local preference
  const DEV_PORT = Number(env.PORT || env.VITE_PORT || 5180)

  return {
    plugins: [
      react(),
      // Bundle analysis: generates dist/bundle-stats.html on build
      mode === 'production' && visualizer({ 
        open: false, 
        filename: 'dist/bundle-stats.html',
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    resolve: {
      dedupe: ['react', 'react-dom']
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    // build settings
  // Support GitHub Pages: custom domain (CNAME) uses '/' base, repo pages use BASE_PATH
  // Since we have a custom domain (www.travelcolleco.com), always use '/' for production
  base: BASE_PATH,
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
    },
    build: {
      // Raise the warning threshold slightly; keep guardrails
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Basic chunking to keep vendor libs separate and shrink app chunks
          manualChunks: {
            react: ['react', 'react-dom'],
            motion: ['framer-motion'],
            icons: ['lucide-react'],
            pdf: ['jspdf'],
            canvas: ['html2canvas'],
            dompurify: ['dompurify'],
          },
        },
      },
    }
  }
})
