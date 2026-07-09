/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { URL, fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_PUBLIC_URL
  const port = Number(env.VITE_PUBLIC_PORT) || 3000

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    base: base,
    server: {
      port
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/__tests__/**/*.test.{ts,tsx}'],
      restoreMocks: true
    }
  }
})
