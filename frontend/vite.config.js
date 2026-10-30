import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/teachers': 'http://localhost:5001',
      '/teacher-positions': 'http://localhost:5001',
      '/students': 'http://localhost:5001',
      '/auth': 'http://localhost:5001',
    },
  },
})
