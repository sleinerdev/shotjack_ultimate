import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@vercel/analytics/next': fileURLToPath(
        new URL('./src/lib/vercelAnalyticsNext.tsx', import.meta.url)
      )
    }
  },
  server: {
    port: 5173
  }
})

