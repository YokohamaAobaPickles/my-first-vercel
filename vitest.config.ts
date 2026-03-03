/**
 * Filename: vitest.config.ts
 * Version: V1.1.0
 * Update: 2026-03-03
 * Remarks: V1.1.0 - .env.localをテスト環境で読み込む設定を追加
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { loadEnv } from 'vite' // 追加

export default defineConfig(({ mode }) => {
  // .env.local などを読み込む設定を追加
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/setupTests.ts'],
      // 環境変数を確実にロードするための設定
      env: loadEnv(mode, process.cwd(), ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@v1': path.resolve(__dirname, './src/V1'),
      },
    },
  }
})