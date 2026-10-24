import { defineConfig } from 'vite';

// GitHub Pages serves the site from /<repo>/, so the deploy workflow sets BASE_PATH.
export default defineConfig({
  root: 'web',
  base: process.env.BASE_PATH ?? '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
