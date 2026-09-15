import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages: https://<user>.github.io/mkt_math/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/mkt_math/',
  plugins: [react(), tailwindcss()],
})
