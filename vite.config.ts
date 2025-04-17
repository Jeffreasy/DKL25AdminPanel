import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => ({
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
    port: parseInt(process.env.PORT || '3000'),
    strictPort: true,
    hmr: command === 'serve' ? {
      protocol: 'ws',
      host: 'localhost',
      port: 24678,
      clientPort: 24678
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
