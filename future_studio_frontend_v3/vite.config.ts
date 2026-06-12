import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    reactClickToComponent(),
  ],
  server: {
    port: 3000,
  }
})
