import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@data': path.resolve(__dirname, '../data'),
    },
  },
  plugins: [
    react(),
    reactClickToComponent(),
  ],
  server: {
    port: 3000,
    fs: {
      allow: ['..'],
    },
  }
})
