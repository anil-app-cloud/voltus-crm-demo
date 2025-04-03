// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    open: true,
    allowedHosts: [
      'voltus-crm-demo-1.onrender.com', // Add Render host as a fallback
      'localhost' // Keep for local dev
    ]
  },
  preview: {
    port: 5173
  },
  build: {
    outDir: 'dist', // Explicitly set output directory
    sourcemap: false // Optional: Disable sourcemaps for production
  }
})