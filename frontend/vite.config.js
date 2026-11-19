import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' hace que la app funcione en cualquier ruta (GitHub Pages, un dominio propio
// o una subcarpeta) sin cambiar nada. La navegación usa # en la URL, así que no se
// necesita configurar el servidor.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // Separa las librerías pesadas en archivos aparte que solo se descargan cuando se usan
    // (el mapa en la pantalla de la ruta y Firebase en las reseñas).
    rollupOptions: {
      output: {
        manualChunks: {
          mapa: ['leaflet'],
        },
      },
    },
  },
})
