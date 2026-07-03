import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permite conexiones externas, no solo localhost
    // el "." inicial permite cualquier subdominio de ngrok (la URL gratis cambia cada sesión)
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'],
    proxy: {
      // el front pide a /api/... (mismo origen) y Vite lo reenvía al backend,
      // quitándole el prefijo /api. Evita CORS y no depende de localhost en el visitante.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
