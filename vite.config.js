import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('/node_modules/')) {
            if (
              normalized.includes('/node_modules/react/') ||
              normalized.includes('/node_modules/react-dom/') ||
              normalized.includes('/node_modules/react-router/') ||
              normalized.includes('/node_modules/react-router-dom/') ||
              normalized.includes('/node_modules/react-is/') ||
              normalized.includes('/node_modules/scheduler/') ||
              normalized.includes('/node_modules/clsx/') ||
              normalized.includes('/node_modules/use-sync-external-store/')
            ) {
              return 'react-vendor';
            }
            if (normalized.includes('/node_modules/firebase/') || normalized.includes('/node_modules/@firebase/')) {
              return 'firebase';
            }
            if (normalized.includes('/node_modules/framer-motion/')) return 'motion-vendor';
            if (normalized.includes('/node_modules/recharts/')) return 'charts-vendor';
            if (normalized.includes('/node_modules/lucide-react/')) return 'icons-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})
