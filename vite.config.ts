import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    },
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: parseInt(process.env.PORT || '5173'),
    strictPort: false, // Allow fallback to next available port
    hmr: command === 'serve' ? {
      protocol: 'ws',
      host: 'localhost',
    } : false
  },
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ],
    exclude: [
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'dompurify'
    ]
  }
}))
