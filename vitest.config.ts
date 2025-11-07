import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/*.spec.ts',
      '**/*.config.*',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/dist/',
        '**/e2e/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend/app'),
      '@components': path.resolve(__dirname, 'frontend/app/components'),
      '@hooks': path.resolve(__dirname, 'frontend/app/hooks'),
      '@lib': path.resolve(__dirname, 'frontend/app/lib'),
      '@types': path.resolve(__dirname, 'frontend/app/types'),
    },
  },
})

