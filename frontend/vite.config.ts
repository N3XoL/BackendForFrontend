import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/react-ui',
  server: {
    allowedHosts: ['host.docker.internal', 'frontend'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  }
})
