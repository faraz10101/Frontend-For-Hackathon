import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In development every /api/... call is forwarded to the backend (default http://localhost:5000),
// so the browser sees one origin and the login cookie works without extra CORS setup.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: process.env.VITE_API_TARGET || 'http://localhost:5000', changeOrigin: true },
    },
  },
})
