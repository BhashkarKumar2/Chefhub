import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React vendor chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries chunk
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-icons'],
          
          // Query library chunk
          'query-vendor': ['@tanstack/react-query'],
          
          // Firebase chunk (large library)
          'firebase-vendor': ['firebase/app', 'firebase/auth'],
          
          // Other heavy libraries
          'heavy-vendor': ['socket.io-client', 'axios'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Enable source maps for debugging (optional, remove in production)
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: false,
  },
  server: {
    // Optimize dev server
    hmr: {
      overlay: true,
    },
  },
})
