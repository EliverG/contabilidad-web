import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/contabilidad": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
