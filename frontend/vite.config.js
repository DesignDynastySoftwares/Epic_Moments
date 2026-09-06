// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    // Compresses PNG/JPG/WebP/SVG assets at build time (source files untouched)
    ViteImageOptimizer({
      png: { quality: 70 },
      jpeg: { quality: 70 },
      jpg: { quality: 70 },
      webp: { quality: 70 },
      svg: {
        multipass: true,
        plugins: ['preset-default'],
      },
    }),
  ],
  base: '/', // 👈 Important: ensure this is '/' unless deploying to a subpath
  build: {
    chunkSizeWarningLimit: 900,
  },
  preview: {
    port: process.env.PORT || 4173,
    host: true,
    allowedHosts: ['epic-new-frontend.onrender.com']
  }
})
