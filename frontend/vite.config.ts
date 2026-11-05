import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // In `npm run dev`, forward API calls to the Spring Boot backend (nginx does this in Docker)
  server: {
    proxy: {
      '/api': 'http://localhost:8082',
      '/ws': { target: 'ws://localhost:8082', ws: true },
    },
  },
})
