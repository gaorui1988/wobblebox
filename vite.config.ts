import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: '127.0.0.1', port: 4731, strictPort: true },
  preview: { host: '127.0.0.1', port: 4731, strictPort: true },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsInlineLimit: 0,
    target: 'es2020',
  },
});
