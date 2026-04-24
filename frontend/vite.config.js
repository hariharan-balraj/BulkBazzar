import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8080',
      '/listings': 'http://localhost:8080',
      '/events': 'http://localhost:8080',
      '/upload': 'http://localhost:8080',
      '/media': 'http://localhost:8080',
    },
  },
})
