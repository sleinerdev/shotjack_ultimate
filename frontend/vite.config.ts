import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@vercel/analytics/next',
        replacement: path.resolve(rootDir, 'src/lib/vercelAnalyticsNext.tsx')
      }
    ]
  },
  server: {
    port: 5173
  }
})

