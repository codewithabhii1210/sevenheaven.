import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Root level .env file use karega (folder ke bahar)
  envDir: '../',
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/')
          ) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons'
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
