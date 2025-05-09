import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setup.js',
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',  // Change output directory from 'dist' to 'build'
    rollupOptions: {
      external: ['@ant-design/icons']
    }
  }
})