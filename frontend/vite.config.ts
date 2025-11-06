import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
      '@components': path.resolve(__dirname, './app/components'),
      '@lib': path.resolve(__dirname, './app/lib'),
      '@hooks': path.resolve(__dirname, './app/hooks'),
      '@types': path.resolve(__dirname, './types'),
      '@utils': path.resolve(__dirname, '../utils'),
      '@styles': path.resolve(__dirname, './app/styles'),
      '@config': path.resolve(__dirname, '../config'),
    }
  },
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      }
    }
  }
})
