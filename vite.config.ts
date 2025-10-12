import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/voicebook-frontend/',
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  publicDir: './public',
  server: {
    host: true,
  },
});
