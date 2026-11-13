import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base: the dist/ folder works from any local server, with no network.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
});
