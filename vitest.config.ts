import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
  },
  resolve: {
    alias: {
      // "@" を "src フォルダの絶対パス" に結びつける
      '@': path.resolve(__dirname, './src'),
    },
  },
})