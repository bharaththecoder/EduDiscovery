import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: process.env.NODE_ENV === 'production' ? 'auto' : null,
      devOptions: {
        enabled: false,
      },
      manifest: false,
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      'firebase/storage'
    ],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'recharts',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      'firebase/storage'
    ],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mlc-ai/web-llm') || id.includes('@google/generative-ai')) return 'ai-vendor';
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('framer-motion')) return 'motion-vendor';
            if (id.includes('recharts')) return 'charts-vendor';
            if (id.includes('lucide-react')) return 'icons-vendor';
            if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router-dom/')) return 'react-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})
